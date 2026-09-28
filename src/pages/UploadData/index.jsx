import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ContentLayout } from "../../components/organisms/ContentLayout";
import { uploadFile } from "../../api/api";
import "./style.css";

export const UploadData = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  const chooseFile = (candidate) => {
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setStatus({ type: "error", message: "Pilih file Excel dengan format .xlsx." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(candidate);
    setStatus({ type: "", message: "" });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!uploading) chooseFile(event.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    setStatus({ type: "", message: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file || uploading || status.type === "success") return;
    setUploading(true);
    setStatus({ type: "", message: "" });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await uploadFile(formData);
      if (response?.status === 200 || response?.status === 201) {
        setStatus({ type: "success", message: response?.data?.message || "Barang berhasil diimpor. Buka daftar barang untuk melihat hasilnya." });
      } else {
        setStatus({ type: "error", message: response?.data?.message || "File belum berhasil diimpor. Periksa isi file dan coba lagi." });
      }
    } catch (error) {
      setStatus({ type: "error", message: error?.response?.data?.message || error.message || "Impor gagal. Silakan coba lagi." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ContentLayout>
      <main className="import-page">
        <Link to="/barang" className="import-back"><ArrowLeftIcon /> Kembali ke daftar barang</Link>
        <header className="import-header">
          <span><DocumentArrowUpIcon /> KATALOG BARANG</span>
          <h1>Impor data barang</h1>
          <p>Tambahkan banyak barang sekaligus dari file Excel. Pilih file, periksa namanya, lalu mulai impor.</p>
        </header>

        <div className="import-grid">
          <section className="import-card" aria-labelledby="import-card-title">
            <div className="import-card__heading"><span>01</span><div><h2 id="import-card-title">Pilih file Excel</h2><p>Format yang diterima: .xlsx</p></div></div>
            <div
              className={`import-dropzone${dragging ? " is-dragging" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} id="import-file" type="file" accept=".xlsx" onChange={(event) => chooseFile(event.target.files[0])} disabled={uploading} />
              <ArrowUpTrayIcon />
              <strong>Tarik file Excel ke sini</strong>
              <span>atau pilih dari perangkat Anda</span>
              <label htmlFor="import-file">Pilih file</label>
            </div>

            {file && (
              <div className="import-selected"><DocumentTextIcon /><div><strong>{file.name}</strong><span>{(file.size / 1024).toLocaleString("id-ID", { maximumFractionDigits: 0 })} KB · Siap diimpor</span></div><button type="button" aria-label="Hapus file yang dipilih" onClick={clearFile} disabled={uploading}><XMarkIcon /></button></div>
            )}
            {status.message && <p className={`import-status import-status--${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.type === "success" && <CheckCircleIcon />}{status.message}</p>}
            <div className="import-actions"><button type="button" onClick={handleUpload} disabled={!file || uploading || status.type === "success"}>{uploading ? "Mengimpor..." : status.type === "success" ? "Impor selesai" : "Mulai impor barang"}</button></div>
          </section>

          <aside className="import-help">
            <h2>Sebelum mengimpor</h2>
            <ol><li><span>1</span>Siapkan data barang dalam file Excel (.xlsx).</li><li><span>2</span>Pastikan nama barang dan harga terisi sesuai format data Anda.</li><li><span>3</span>Periksa nama file sebelum menekan “Mulai impor barang”.</li></ol>
            <p>Setelah berhasil, hasil impor dapat dilihat pada menu Barang.</p>
          </aside>
        </div>
      </main>
    </ContentLayout>
  );
};
