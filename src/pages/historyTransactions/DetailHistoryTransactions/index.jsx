import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CheckCircleIcon,
  PrinterIcon,
  ReceiptPercentIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ContentLayout } from "../../../components/organisms/ContentLayout";
import { TableData } from "../../../components/organisms/TableData";
import { getHistoryTransactionDetail, updatePaid } from "../../../api/api";
import { formatCurrency } from "../../../utils";
import "./style.css";

const isPaid = (transaction) =>
  transaction?.lunas === true ||
  transaction?.lunas === 1 ||
  transaction?.lunas === "true" ||
  Number(transaction?.hutang ?? 0) <= 0;

const displayDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(parsed);
};

export const DetailHistoryTransactions = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formPaid, setFormPaid] = useState(false);
  const [formDebt, setFormDebt] = useState("0");
  const [formError, setFormError] = useState("");
  const closeRef = useRef(null);

  const loadDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getHistoryTransactionDetail(id);
      const detail = response?.data || response;
      if (!detail) throw new Error("Detail transaksi tidak ditemukan.");
      setTransaction(detail);
    } catch (err) {
      console.error("Gagal memuat detail transaksi:", err);
      setError(err.message || "Detail transaksi belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) loadDetail(); }, [id]);
  useEffect(() => {
    if (!modalOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) setModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, saving]);

  const openModal = () => {
    setFormPaid(isPaid(transaction));
    setFormDebt(String(transaction?.hutang ?? 0));
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const debt = formPaid ? 0 : Number(formDebt);
    if (!Number.isFinite(debt) || debt < 0) {
      setFormError("Masukkan jumlah hutang yang valid.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const result = await updatePaid(id, { lunas: formPaid, hutang: debt });
      if (result?.success === false) throw new Error("Perubahan pembayaran gagal disimpan.");
      setModalOpen(false);
      setNotice("Status pembayaran berhasil diperbarui.");
      await loadDetail();
    } catch (err) {
      setFormError(err.message || "Perubahan gagal disimpan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!transaction) return;
    const { transactionCode, items, total, description, date, customer, hutang, discount, note } = transaction;
    sessionStorage.setItem("transactionData", JSON.stringify({
      transactionCode, items, total, metodePembayaran: description, date, customer, hutang, discount, note,
    }));
    const printTab = window.open("/payment", "_blank");
    if (printTab) printTab.focus();
    else setNotice("Browser memblokir halaman struk. Izinkan pop-up, lalu coba lagi.");
  };

  return (
    <ContentLayout>
      <main className="history-detail-page">
        <Link to="/riwayat-transaksi" className="history-detail-back"><ArrowLeftIcon /> Kembali ke riwayat transaksi</Link>
        {loading ? <div className="history-detail-state">Memuat detail transaksi...</div> : error || !transaction ? (
          <div className="history-detail-state"><h2>Detail belum tersedia</h2><p>{error || "Transaksi tidak ditemukan."}</p><button type="button" onClick={loadDetail}>Coba lagi</button></div>
        ) : (
          <>
            <header className="history-detail-header">
              <div><span><ReceiptPercentIcon /> RINCIAN TRANSAKSI</span><h1>Detail transaksi</h1><p>{displayDate(transaction.date || transaction.createdAt)}</p></div>
              <div className="history-detail-header__actions"><button type="button" onClick={openModal}>Ubah pembayaran</button><button type="button" onClick={handlePrintReceipt}><PrinterIcon /> Cetak struk</button></div>
            </header>
            {notice && <p className="history-detail-notice" role="status">{notice}</p>}
            <section className="history-detail-meta" aria-label="Informasi transaksi">
              <article><span className="history-detail-meta__icon"><UserIcon /></span><div><small>Pelanggan</small><strong>{transaction.customer || "Tidak tercatat"}</strong></div></article>
              <article><span className="history-detail-meta__icon"><ReceiptPercentIcon /></span><div><small>Kode transaksi</small><strong>{transaction.transactionCode || "—"}</strong></div></article>
              <article><span className="history-detail-meta__icon"><BanknotesIcon /></span><div><small>Metode pembayaran</small><strong>{transaction.description || "Tidak tercatat"}</strong></div></article>
              <article><span className="history-detail-meta__icon"><CheckCircleIcon /></span><div><small>Status pembayaran</small><strong className={isPaid(transaction) ? "history-detail-badge is-paid" : "history-detail-badge is-unpaid"}>{isPaid(transaction) ? "Lunas" : "Belum lunas"}</strong></div></article>
            </section>
            <section className="history-detail-products" aria-label="Daftar barang">
              <div className="history-detail-section-heading"><div><h2>Daftar produk</h2><p>{Array.isArray(transaction.items) ? `${transaction.items.length} jenis barang dalam transaksi` : "Rincian barang dalam transaksi"}</p></div></div>
              {Array.isArray(transaction.items) && transaction.items.length > 0 ? (
                <TableData data={transaction.items.map(({ stock, price_ecer, price_grosir, ...item }) => item)} showPagination={false} />
              ) : <p className="history-detail-empty">Data produk tidak tersedia untuk transaksi ini.</p>}
            </section>
            <div className="history-detail-bottom">
              <section className="history-detail-note"><h2>Catatan transaksi</h2><p>{transaction.note || "Tidak ada catatan untuk transaksi ini."}</p></section>
              <section className="history-detail-totals"><h2>Ringkasan pembayaran</h2><div><span>Diskon</span><strong>- {formatCurrency(transaction.discount || 0)}</strong></div><div><span>Hutang</span><strong>{formatCurrency(transaction.hutang || 0)}</strong></div><div className="history-detail-totals__total"><span>Total transaksi</span><strong>{formatCurrency(transaction.total || 0)}</strong></div></section>
            </div>
          </>
        )}
      </main>

      {modalOpen && (
        <div className="history-payment-layer">
          <button type="button" className="history-payment-backdrop" aria-label="Tutup modal pembayaran" onClick={() => !saving && setModalOpen(false)} />
          <section className="history-payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
            <header><div><span>PEMBAYARAN TRANSAKSI</span><h2 id="payment-modal-title">Ubah status pembayaran</h2><p>Periksa sisa hutang sebelum menyimpan perubahan.</p></div><button type="button" ref={closeRef} aria-label="Tutup modal" onClick={() => setModalOpen(false)} disabled={saving}><XMarkIcon /></button></header>
            <form onSubmit={handleSave}>
              <div className="history-payment-modal__body">
                <div className="history-payment-modal__context"><span>Kode transaksi</span><strong>{transaction?.transactionCode || "—"}</strong></div>
                <button type="button" className="history-payment-switch-row" role="switch" aria-checked={formPaid} onClick={() => setFormPaid((current) => !current)}><span><strong>Pembayaran lunas</strong><small>{formPaid ? "Seluruh hutang akan menjadi Rp 0." : "Masukkan sisa hutang di bawah."}</small></span><span className={`history-payment-switch${formPaid ? " is-on" : ""}`}><span /></span></button>
                <div className="history-payment-field"><label htmlFor="payment-debt">Sisa hutang</label><div><span>Rp</span><input id="payment-debt" type="number" min="0" step="1" value={formPaid ? 0 : formDebt} onChange={(event) => setFormDebt(event.target.value)} disabled={formPaid} required /></div></div>
                {formError && <p className="history-payment-error" role="alert">{formError}</p>}
              </div>
              <footer><button type="button" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan perubahan"}</button></footer>
            </form>
          </section>
        </div>
      )}
    </ContentLayout>
  );
};
