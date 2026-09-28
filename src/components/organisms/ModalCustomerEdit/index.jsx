import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { updateCustomerData } from "../../../api/api";

export const ModalCustomerEdit = ({ onClick, id, name, telp, type, nik, npwp, onUpdate }) => {
  const [form, setForm] = useState({
    name: name || "",
    telp: telp || "",
    type: type || "",
    nik: nik === "-" ? "" : nik || "",
    npwp: npwp === "-" ? "" : npwp || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClick();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClick, saving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const phone = String(form.telp).replace(/[^0-9]/g, "");
    if (!form.name.trim() || !phone || !form.type) {
      setError("Isi nama, nomor telepon, dan jenis pelanggan.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateCustomerData(id, {
        name: form.name.trim(),
        telp: phone,
        type: form.type,
        nik: form.nik.trim() || "-",
        npwp: form.npwp.trim() || "-",
      });
      onClick();
      onUpdate?.();
    } catch (err) {
      setError(err.message || "Perubahan pelanggan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-edit-title">
      <header className="customer-modal__header"><div><span>DATA PELANGGAN</span><h2 id="customer-edit-title">Edit pelanggan</h2><p>Perbarui informasi kontak dan identitas pelanggan.</p></div><button type="button" ref={closeRef} className="customer-modal__close" aria-label="Tutup" onClick={onClick} disabled={saving}><XMarkIcon /></button></header>
      <form onSubmit={handleSubmit}>
        <div className="customer-modal__fields">
          <div className="customer-modal__field customer-modal__field--full"><label htmlFor="edit-customer-name">Nama pelanggan <span>*</span></label><input id="edit-customer-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div>
          <div className="customer-modal__field"><label htmlFor="edit-customer-phone">Nomor telepon <span>*</span></label><input id="edit-customer-phone" type="tel" inputMode="numeric" value={form.telp} onChange={(event) => setForm({ ...form, telp: event.target.value })} required /></div>
          <div className="customer-modal__field"><label htmlFor="edit-customer-type">Jenis pelanggan <span>*</span></label><select id="edit-customer-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} required><option value="" disabled>Pilih jenis</option><option value="VIP">VIP</option><option value="Regular">Regular</option>{form.type && !["VIP", "Regular"].includes(form.type) && <option value={form.type}>{form.type}</option>}</select></div>
          <div className="customer-modal__field"><label htmlFor="edit-customer-nik">NIK <small>Opsional</small></label><input id="edit-customer-nik" value={form.nik} onChange={(event) => setForm({ ...form, nik: event.target.value })} placeholder="Nomor identitas" /></div>
          <div className="customer-modal__field"><label htmlFor="edit-customer-npwp">NPWP <small>Opsional</small></label><input id="edit-customer-npwp" value={form.npwp} onChange={(event) => setForm({ ...form, npwp: event.target.value })} placeholder="Nomor NPWP" /></div>
        </div>
        {error && <p className="customer-modal__error" role="alert">{error}</p>}
        <footer className="customer-modal__actions"><button type="button" onClick={onClick} disabled={saving}>Batal</button><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan perubahan"}</button></footer>
      </form>
    </section>
  );
};
