import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  CubeIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { ContentLayout } from "../../components/organisms/ContentLayout";
import { exportOutbond, getAllOutbond, getAllProducts } from "../../api/api";
import { formatCurrency } from "../../utils";
import "./style.css";

const PAGE_SIZE = 8;

const localDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const dateKey = (value) => {
  if (!value) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : localDateKey(parsed);
};

const recordDate = (record) => dateKey(record.createdAt || record.date || record.tanggal);
const recordCode = (record) => record.transactionCode || record.code || record.kodeTransaksi || "—";
const recordCustomer = (record) => {
  const customer = record.customer || record.pelanggan;
  return typeof customer === "string" ? customer || "—" : customer?.name || "—";
};
const recordUnits = (record) => {
  if (!Array.isArray(record.items)) {
    const direct = record.amount ?? record.quantity ?? record.qty ?? record.jumlah;
    return direct == null ? null : Number(direct) || 0;
  }
  return record.items.reduce((sum, item) => sum + (Number(item.amount ?? item.quantity ?? 0) || 0), 0);
};
const recordValue = (record) => {
  const value = record.total ?? record.totalPrice ?? record.totalHarga ?? record.value;
  if (value == null || value === "") return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};
const recordProducts = (record, productById) => {
  if (!Array.isArray(record.items)) return record.product?.name || record.productName || record.name || "—";
  const names = record.items.map((item) =>
    item.name || item.product?.name || productById.get(String(item.product_id ?? item.productId ?? item.id)) || null
  ).filter(Boolean);
  if (!names.length) return "—";
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", ");
};
const displayDate = (key) => {
  if (!key) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${key}T00:00:00`));
};

export const ReportOutbond = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [range, setRange] = useState("all");
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const loadRecords = async () => {
    setLoadingData(true);
    setError("");
    try {
      const [outboundResult, productsResult] = await Promise.allSettled([getAllOutbond(), getAllProducts()]);
      if (outboundResult.status === "rejected") throw outboundResult.reason;
      const response = outboundResult.value;
      setRecords(Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : []);
      if (productsResult.status === "fulfilled" && Array.isArray(productsResult.value)) setProducts(productsResult.value);
    } catch (err) {
      console.error("Gagal memuat laporan barang keluar:", err);
      setError("Data laporan belum dapat dimuat. Coba muat ulang.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const selectRange = (value) => {
    setRange(value);
    setPage(1);
    if (value === "all") {
      setFromDate("");
      setToDate("");
      return;
    }
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (value === "7days" ? 6 : 29));
    setFromDate(localDateKey(start));
    setToDate(localDateKey(today));
  };

  const invalidRange = Boolean(fromDate && toDate && fromDate > toDate);
  const productById = useMemo(() => new Map(products.map((product) => [String(product.id), product.name])), [products]);
  const filtered = useMemo(() => {
    if (invalidRange) return [];
    return records
      .filter((record) => {
        const date = recordDate(record);
        return (!fromDate || (date && date >= fromDate)) && (!toDate || (date && date <= toDate));
      })
      .sort((a, b) => recordDate(b).localeCompare(recordDate(a)));
  }, [records, fromDate, toDate, invalidRange]);

  const totalUnits = filtered.reduce((sum, record) => sum + (recordUnits(record) ?? 0), 0);
  const hasUnitData = filtered.some((record) => recordUnits(record) !== null);
  const totalValue = filtered.reduce((sum, record) => sum + (recordValue(record) || 0), 0);
  const hasValueData = filtered.some((record) => recordValue(record) !== null);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = async (event) => {
    event.preventDefault();
    if (invalidRange || exporting) return;
    setExporting(true);
    setError("");
    try {
      await exportOutbond(fromDate, toDate);
    } catch (err) {
      console.error("Gagal mengekspor laporan barang keluar:", err);
      setError("Laporan gagal diunduh. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ContentLayout>
      <main className="outbound-page">
        <header className="outbound-header">
          <div>
            <span className="outbound-eyebrow"><DocumentChartBarIcon /> LAPORAN OPERASIONAL</span>
            <h1>Laporan barang keluar</h1>
            <p>Pantau transaksi barang keluar dan unduh laporan sesuai periode yang dibutuhkan.</p>
          </div>
          <button type="button" className="outbound-refresh" onClick={loadRecords} disabled={loadingData} aria-label="Muat ulang data laporan"><ArrowPathIcon /> Muat ulang</button>
        </header>

        <section className="outbound-filter" aria-labelledby="outbound-filter-title">
          <div className="outbound-filter__heading"><div><h2 id="outbound-filter-title">Pilih periode</h2><p>Rentang tanggal berlaku untuk pratinjau dan file yang diunduh.</p></div><CalendarDaysIcon /></div>
          <div className="outbound-range" aria-label="Rentang cepat">
            {[["all", "Semua waktu"], ["7days", "7 hari terakhir"], ["30days", "30 hari terakhir"]].map(([value, label]) => (
              <button key={value} type="button" className={range === value ? "is-active" : ""} aria-pressed={range === value} onClick={() => selectRange(value)}>{label}</button>
            ))}
          </div>
          <form className="outbound-filter__form" onSubmit={handleExport}>
            <div className="outbound-date-field"><label htmlFor="outbound-from">Dari tanggal</label><input id="outbound-from" type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setRange("custom"); setPage(1); }} /></div>
            <div className="outbound-date-field"><label htmlFor="outbound-to">Sampai tanggal</label><input id="outbound-to" type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setRange("custom"); setPage(1); }} /></div>
            <button type="submit" className="outbound-export" disabled={exporting || invalidRange}><ArrowDownTrayIcon /> {exporting ? "Mengunduh..." : "Unduh laporan"}</button>
          </form>
          {invalidRange && <p className="outbound-range-error" role="alert">Tanggal awal harus sebelum atau sama dengan tanggal akhir.</p>}
        </section>

        {error && <p className="outbound-alert" role="alert">{error}</p>}

        <section className="outbound-stats" aria-label="Ringkasan periode">
          <article><span className="outbound-stats__icon outbound-stats__icon--green"><DocumentChartBarIcon /></span><div><p>Catatan barang keluar</p><strong>{filtered.length.toLocaleString("id-ID")}</strong><small>transaksi pada periode ini</small></div></article>
          <article><span className="outbound-stats__icon outbound-stats__icon--orange"><CubeIcon /></span><div><p>Barang keluar</p><strong>{hasUnitData ? totalUnits.toLocaleString("id-ID") : "—"}</strong><small>unit dari rincian transaksi</small></div></article>
          <article><span className="outbound-stats__icon outbound-stats__icon--blue"><ChartBarSquareIcon /></span><div><p>Nilai transaksi</p><strong>{hasValueData ? formatCurrency(totalValue) : "—"}</strong><small>total pada periode ini</small></div></article>
        </section>

        <section className="outbound-list" aria-labelledby="outbound-list-title">
          <div className="outbound-list__heading"><div><h2 id="outbound-list-title">Pratinjau laporan</h2><p>{fromDate || toDate ? `${fromDate ? displayDate(fromDate) : "Awal data"} – ${toDate ? displayDate(toDate) : "Hari ini"}` : "Semua periode"}</p></div><span>{filtered.length} catatan</span></div>
          {loadingData ? <div className="outbound-empty">Memuat data barang keluar...</div> : filtered.length === 0 ? (
            <div className="outbound-empty"><DocumentChartBarIcon /><h3>Belum ada data pada periode ini</h3><p>Coba pilih rentang waktu lain atau muat ulang data.</p></div>
          ) : (
            <>
              <div className="outbound-table-scroll"><table><thead><tr><th>Tanggal</th><th>Kode transaksi</th><th>Pelanggan</th><th>Barang</th><th>Jumlah</th><th>Nilai transaksi</th></tr></thead><tbody>{visibleRecords.map((record, index) => (
                <tr key={record.id ?? record.transactionCode ?? `${recordDate(record)}-${index}`}><td>{displayDate(recordDate(record))}</td><td className="outbound-code">{recordCode(record)}</td><td>{recordCustomer(record)}</td><td className="outbound-product">{recordProducts(record, productById)}</td><td>{recordUnits(record) == null ? "—" : `${recordUnits(record)} unit`}</td><td>{recordValue(record) == null ? "—" : formatCurrency(recordValue(record))}</td></tr>
              ))}</tbody></table></div>
              <div className="outbound-pagination"><span>Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} catatan</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Sebelumnya</button><span>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Berikutnya</button></div></div>
            </>
          )}
        </section>
      </main>
    </ContentLayout>
  );
};
