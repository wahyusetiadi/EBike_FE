import { useState } from "react";
import { ArrowPathIcon, CheckCircleIcon, Cog6ToothIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";
import { ContentLayout } from "../../components/organisms/ContentLayout";
import {
  exampleTransactionCode,
  getReceiptSettings,
  resetReceiptSettings,
  saveReceiptSettings,
} from "../../utils/receiptSettings";
import "./style.css";

const fields = [
  { key: "storeName", label: "Nama toko", required: true, maxLength: 80, placeholder: "Nama yang tampil di kepala struk" },
  { key: "address", label: "Alamat toko", maxLength: 160, placeholder: "Alamat yang tampil di struk" },
  { key: "phone", label: "Nomor telepon", maxLength: 50, placeholder: "Nomor kontak toko" },
  { key: "website", label: "Situs web", maxLength: 100, placeholder: "Contoh: www.tokoanda.com" },
  { key: "receiptTitle", label: "Judul struk", required: true, maxLength: 80, placeholder: "Contoh: Struk Pembelian" },
];

export const Settings = () => {
  const [values, setValues] = useState(getReceiptSettings);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setNotice("");
    setError("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    try {
      const saved = saveReceiptSettings(values);
      setValues(saved);
      setError("");
      setNotice("Pengaturan struk berhasil disimpan di browser ini.");
    } catch {
      setError("Pengaturan tidak dapat disimpan. Periksa izin penyimpanan browser.");
      setNotice("");
    }
  };

  const handleReset = () => {
    try {
      setValues(resetReceiptSettings());
      setError("");
      setNotice("Pengaturan bawaan telah dipulihkan di browser ini.");
    } catch {
      setError("Pengaturan tidak dapat dipulihkan. Periksa izin penyimpanan browser.");
      setNotice("");
    }
  };

  return (
    <ContentLayout>
      <main className="settings-page">
        <header className="settings-header">
          <span><Cog6ToothIcon /> PENGATURAN TOKO</span>
          <h1>Pengaturan struk</h1>
          <p>Atur identitas toko, pesan pada struk, dan awalan kode untuk transaksi baru.</p>
        </header>

        <div className="settings-grid">
          <form className="settings-card" onSubmit={handleSave}>
            <div className="settings-card__heading"><h2>Identitas pada struk</h2><p>Informasi ini tampil pada struk baru dan saat mencetak ulang riwayat transaksi.</p></div>
            <div className="settings-fields">
              {fields.map(({ key, label, required, maxLength, placeholder }) => (
                <div className={key === "address" ? "settings-field settings-field--wide" : "settings-field"} key={key}>
                  <label htmlFor={key}>{label}{required && <span> *</span>}</label>
                  <input id={key} value={values[key]} onChange={(event) => update(key, event.target.value)} maxLength={maxLength} placeholder={placeholder} required={required} />
                </div>
              ))}
              <div className="settings-field settings-field--wide">
                <label htmlFor="footerNote">Pesan tambahan di bawah struk</label>
                <textarea id="footerNote" rows="3" maxLength="180" value={values.footerNote} onChange={(event) => update("footerNote", event.target.value)} placeholder="Contoh: Simpan struk ini sebagai bukti transaksi." />
              </div>
            </div>

            <div className="settings-card__heading settings-card__heading--separated"><h2>Kode transaksi</h2><p>Awalan ini dipakai untuk kode transaksi eceran dan grosir yang dibuat setelah pengaturan disimpan.</p></div>
            <div className="settings-field settings-field--prefix">
              <label htmlFor="transactionPrefix">Awalan kode</label>
              <input id="transactionPrefix" value={values.transactionPrefix} onChange={(event) => update("transactionPrefix", event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} maxLength="12" required placeholder="GMJ" />
              <small>Huruf A–Z dan angka saja. Contoh: {exampleTransactionCode(values.transactionPrefix)}</small>
            </div>
            {notice && <p className="settings-message settings-message--success" role="status"><CheckCircleIcon />{notice}</p>}
            {error && <p className="settings-message settings-message--error" role="alert">{error}</p>}
            <div className="settings-actions">
              <button type="button" className="settings-reset" onClick={handleReset}><ArrowPathIcon /> Pulihkan bawaan</button>
              <button type="submit" className="settings-save">Simpan pengaturan</button>
            </div>
          </form>

          <aside className="settings-preview">
            <div className="settings-preview__heading"><ReceiptPercentIcon /><div><h2>Pratinjau struk</h2><p>Contoh tampilan dari isian saat ini</p></div></div>
            <div className="settings-preview__paper">
              <div className="settings-preview__brand"><strong>{values.storeName || "Nama toko"}</strong>{values.address && <span>{values.address}</span>}{values.phone && <span>Telp: {values.phone}</span>}</div>
              <div className="settings-preview__divider" />
              <p className="settings-preview__title">{values.receiptTitle || "Judul struk"}</p>
              <p>ID Transaksi: {exampleTransactionCode(values.transactionPrefix)}</p>
              <div className="settings-preview__divider" />
              <div className="settings-preview__sample"><span>Contoh barang × 1</span><span>Rp 100.000</span></div>
              <div className="settings-preview__divider" />
              <div className="settings-preview__sample"><strong>Total bayar</strong><strong>Rp 100.000</strong></div>
              <div className="settings-preview__divider" />
              <div className="settings-preview__footer"><span>Terima kasih telah berbelanja di {values.storeName || "toko kami"}</span>{values.website && <span>{values.website}</span>}{values.footerNote && <span>{values.footerNote}</span>}</div>
            </div>
            <p className="settings-preview__scope">Pengaturan disimpan di browser ini. Perangkat atau browser lain perlu diatur terpisah.</p>
          </aside>
        </div>
      </main>
    </ContentLayout>
  );
};
