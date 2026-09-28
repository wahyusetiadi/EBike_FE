import React, { useEffect, useRef, useState } from "react";
import { MinusIcon, PlusIcon, ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "../../../utils";
import "./style.css";

export const TransactionCart = ({ items, totalItems, totalPrice, priceKey, onIncrease, onDecrease, onCheckout, onReset }) => {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (items.length === 0) setOpen(false);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <>
      <div className="transaction-cart-bar" role="region" aria-label="Ringkasan keranjang">
        <div className="transaction-cart-bar__summary" aria-live="polite">
          <span className="transaction-cart-bar__icon"><ShoppingBagIcon /></span>
          <span><strong>{totalItems} barang dipilih</strong><small>{formatCurrency(totalPrice)}</small></span>
        </div>
        <div className="transaction-cart-bar__actions">
          <button type="button" className="transaction-cart-bar__view" onClick={() => setOpen(true)}>Lihat pesanan <span aria-hidden="true">({items.length})</span></button>
          <button type="button" className="transaction-cart-bar__checkout" onClick={onCheckout}>Lanjut checkout</button>
        </div>
      </div>
      {open && (
        <>
          <button type="button" className="transaction-cart-backdrop" aria-label="Tutup keranjang" onClick={() => setOpen(false)} />
          <aside className="transaction-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="transaction-cart-title">
            <header className="transaction-cart-drawer__header">
              <div><span>KERANJANG TRANSAKSI</span><h2 id="transaction-cart-title">Pesanan Anda</h2><p>Atur jumlah barang sebelum checkout.</p></div>
              <button type="button" ref={closeButtonRef} aria-label="Tutup keranjang" onClick={() => setOpen(false)}><XMarkIcon /></button>
            </header>
            <ul className="transaction-cart-drawer__items">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="transaction-cart-drawer__item-info">
                    <strong>{item.name}</strong>
                    <small>{formatCurrency(item[priceKey] ?? 0)} / barang</small>
                    <small className="transaction-cart-drawer__line-total">{formatCurrency((Number(item[priceKey]) || 0) * item.quantity)}</small>
                  </div>
                  <div className="transaction-cart-drawer__quantity" aria-label={`Jumlah ${item.name}`}>
                    <button type="button" aria-label={`Kurangi ${item.name}`} onClick={() => onDecrease(item)}><MinusIcon /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Tambah ${item.name}`} onClick={() => onIncrease(item)}><PlusIcon /></button>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="transaction-cart-drawer__footer">
              <div><span>Total sementara <small>{totalItems} barang</small></span><strong>{formatCurrency(totalPrice)}</strong></div>
              <button type="button" className="transaction-cart-drawer__checkout" onClick={onCheckout}>Lanjut ke checkout</button>
              <button type="button" className="transaction-cart-drawer__reset" onClick={() => { onReset(); setOpen(false); }}>Kosongkan keranjang</button>
            </footer>
          </aside>
        </>
      )}
    </>
  );
};
