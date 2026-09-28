import { useEffect, useRef, useState } from "react";
import { PlusIcon, UserGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ContentLayout } from "../../components/organisms/ContentLayout";
import { TableData } from "../../components/organisms/TableData";
import { createCustomer, deleteCustomerData, getAllCustomerData } from "../../api/api";
import "./style.css";

const emptyForm = { name: "", telp: "", type: "", nik: "", npwp: "" };

export const CostumerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const nameRef = useRef(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomerData();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat pelanggan:", error);
      setNotice("Data pelanggan belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => {
    if (!modalOpen) return;
    nameRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) setModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, saving]);

  const openModal = () => {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const phone = form.telp.replace(/[^0-9]/g, "");
    if (!form.name.trim() || !phone || !form.type) {
      setFormError("Isi nama, nomor telepon, dan jenis pelanggan.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createCustomer({
        name: form.name.trim(),
        telp: phone,
        type: form.type,
        nik: form.nik.trim() || "-",
        npwp: form.npwp.trim() || "-",
      });
      setModalOpen(false);
      setNotice("Pelanggan berhasil ditambahkan.");
      await loadCustomers();
    } catch (error) {
      setFormError(error.message || "Pelanggan gagal ditambahkan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomerData(id);
      setNotice("Pelanggan berhasil dihapus.");
      await loadCustomers();
    } catch (error) {
      console.error("Gagal menghapus pelanggan:", error);
      setNotice("Pelanggan gagal dihapus. Silakan coba lagi.");
    }
  };

  return (
    <ContentLayout>
      <main className="customers-page">
        <header className="customers-header">
          <div><span><UserGroupIcon /> DATA PELANGGAN</span><h1>Pelanggan</h1><p>Kelola data pelanggan untuk transaksi eceran dan grosir.</p></div>
          <button type="button" onClick={openModal}><PlusIcon /> Tambah pelanggan</button>
        </header>
        {notice && <p className="customers-notice" role="status">{notice}</p>}
        <section className="customers-list" aria-label="Daftar pelanggan">
          <div className="customers-list__heading"><div><h2>Daftar pelanggan</h2><p>{loading ? "Memuat data..." : `${customers.length} pelanggan terdaftar`}</p></div></div>
          <TableData data={customers} itemsPerPage={10} showSearchSet sortedData showAksi showEditCustomerBtn showDeleteCustomerBtn onDelete={handleDelete} onUpdate={loadCustomers} />
        </section>
      </main>

      {modalOpen && (
        <div className="customer-modal-layer">
          <button type="button" className="customer-modal-backdrop" aria-label="Tutup formulir tambah pelanggan" onClick={() => !saving && setModalOpen(false)} />
          <section className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
            <header className="customer-modal__header">
              <div><span>PELANGGAN BARU</span><h2 id="customer-modal-title">Tambah pelanggan</h2><p>Masukkan informasi yang diperlukan untuk transaksi.</p></div>
              <button type="button" className="customer-modal__close" aria-label="Tutup" onClick={() => setModalOpen(false)} disabled={saving}><XMarkIcon /></button>
            </header>
            <form onSubmit={handleSubmit}>
              <div className="customer-modal__fields">
                <div className="customer-modal__field customer-modal__field--full"><label htmlFor="customer-name">Nama pelanggan <span>*</span></label><input id="customer-name" ref={nameRef} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Budi Santoso" required /></div>
                <div className="customer-modal__field"><label htmlFor="customer-phone">Nomor telepon <span>*</span></label><input id="customer-phone" type="tel" inputMode="numeric" value={form.telp} onChange={(event) => setForm({ ...form, telp: event.target.value })} placeholder="08xxxxxxxxxx" required /></div>
                <div className="customer-modal__field"><label htmlFor="customer-type">Jenis pelanggan <span>*</span></label><select id="customer-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} required><option value="" disabled>Pilih jenis</option><option value="VIP">VIP</option><option value="Regular">Regular</option></select></div>
                <div className="customer-modal__field"><label htmlFor="customer-nik">NIK <small>Opsional</small></label><input id="customer-nik" value={form.nik} onChange={(event) => setForm({ ...form, nik: event.target.value })} placeholder="Nomor identitas" /></div>
                <div className="customer-modal__field"><label htmlFor="customer-npwp">NPWP <small>Opsional</small></label><input id="customer-npwp" value={form.npwp} onChange={(event) => setForm({ ...form, npwp: event.target.value })} placeholder="Nomor NPWP" /></div>
              </div>
              {formError && <p className="customer-modal__error" role="alert">{formError}</p>}
              <footer className="customer-modal__actions"><button type="button" onClick={() => setModalOpen(false)} disabled={saving}>Batal</button><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan pelanggan"}</button></footer>
            </form>
          </section>
        </div>
      )}
    </ContentLayout>
  );
};
