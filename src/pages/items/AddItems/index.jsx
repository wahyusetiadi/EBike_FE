import React, { useEffect, useState } from "react";
import { ContentLayout } from "../../../components/organisms/ContentLayout";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { createProducts } from "../../../api/api";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";

const generateItemCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
};

export const AddItems = () => {
  const [productCode, setProductCode] = useState("");
  const [name, setName] = useState("");
  const [priceEcer, setPriceEcer] = useState("");
  const [priceGrosir, setPriceGrosir] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setProductCode(generateItemCode()), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Nama barang wajib diisi.");
      return;
    }
    setMessage("");
    setSaving(true);
    try {
      await createProducts({
        productCode,
        name,
        price_ecer: priceEcer,
        price_grosir: priceGrosir,
        status,
        isDeleted: false,
      });
      navigate("/barang", { replace: true });
    } catch (error) {
      setMessage(`Gagal menyimpan barang: ${error.message}`);
      setSaving(false);
    }
  };

  return (
    <ContentLayout>
      <div className="item-form-page">
        <Link to="/barang" className="item-form-back"><ChevronLeftIcon /> Kembali ke daftar barang</Link>
        <header className="item-form-heading">
          <span className="item-form-eyebrow">KATALOG BARANG</span>
          <h1>Tambah barang</h1>
          <p>Lengkapi informasi barang dan harga jual untuk mulai mencatat transaksi.</p>
        </header>
        <form className="item-form-card" onSubmit={handleSubmit}>
          <div className="item-form-section-heading"><span>01</span><div><h2>Informasi barang</h2><p>Identitas dan ketersediaan barang.</p></div></div>
          <div className="item-form-grid">
            <div className="item-form-field item-form-field--full">
              <label htmlFor="item-name">Nama barang <span>*</span></label>
              <input id="item-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Sepeda listrik City Rider" required />
            </div>
            <div className="item-form-field">
              <label htmlFor="item-code">Kode barang</label>
              <input id="item-code" type="text" value={productCode} readOnly />
              <small>Dibuat otomatis untuk memudahkan pencarian.</small>
            </div>
            <div className="item-form-field">
              <label htmlFor="item-status">Status barang <span>*</span></label>
              <select id="item-status" value={status} onChange={(event) => setStatus(event.target.value)} required>
                <option value="" disabled>Pilih status barang</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Tidak Tersedia">Tidak Tersedia</option>
              </select>
            </div>
          </div>
          <div className="item-form-section-heading item-form-section-heading--divider"><span>02</span><div><h2>Harga jual</h2><p>Masukkan harga sesuai jenis penjualan.</p></div></div>
          <div className="item-form-grid">
            <div className="item-form-field">
              <label htmlFor="item-wholesale">Harga grosir <span>*</span></label>
              <div className="item-form-money"><span>Rp</span><input id="item-wholesale" type="number" min="0" value={priceGrosir} onChange={(event) => setPriceGrosir(event.target.value)} placeholder="0" required /></div>
            </div>
            <div className="item-form-field">
              <label htmlFor="item-retail">Harga ecer <span>*</span></label>
              <div className="item-form-money"><span>Rp</span><input id="item-retail" type="number" min="0" value={priceEcer} onChange={(event) => setPriceEcer(event.target.value)} placeholder="0" required /></div>
            </div>
          </div>
          {message && <p className="item-form-error" role="alert">{message}</p>}
          <div className="item-form-actions">
            <Link to="/barang" className="item-form-cancel">Batal</Link>
            <button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan barang"}</button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
};
