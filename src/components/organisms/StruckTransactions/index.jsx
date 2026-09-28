import React from "react";
import { Link, useLocation } from "react-router-dom";
import { formatCurrency } from "../../../utils";
import "../../../pages/Transactions/receipt.css";
import { getReceiptSettings } from "../../../utils/receiptSettings";
import { ReceiptFooter, ReceiptHeader } from "../ReceiptSections";

export const StruckTransactions = () => {
  const receiptSettings = getReceiptSettings();
  const location = useLocation();
  const { transactionCode } = location.state || {};
  const { description } = location.state || {};
  const addItems = location.state?.items || [];
  const total = location.state?.total || 0;
  const date = new Date();

  if (!transactionCode && addItems.length === 0) {
    return (
      <div className="receipt-page">
        <div className="receipt-empty">
          <h1>Struk belum tersedia</h1>
          <p>Mulai transaksi dan selesaikan pembayaran untuk melihat struk.</p>
          <Link to="/transaksi/eceran">Mulai transaksi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <div className="receipt-page__intro"><h1>Struk transaksi</h1><p>Periksa rincian sebelum mencetak.</p></div>
      <div className="w-full flex justify-center">
        <div className="receipt-card flex flex-col">
          {/* Header */}
          <ReceiptHeader settings={receiptSettings} />

          <div className="mt-2 text-sm">
            <div className="text-center">
              <p className="font-semibold">{receiptSettings.receiptTitle}</p>
              <p>
                ID Transaksi: <br /> {transactionCode}
              </p>
            </div>
            <hr className="my-2" />
            <div className="text-start">
              <p className="text-xs">{date.toISOString().split("T")[0]}</p>
              <p className="text-xs">{date.toTimeString().split(" ")[0]}</p>
            </div>
          </div>

          <hr className="my-2" />

          {/* Rincian Pembelian */}
          <div className="w-full flex flex-col gap-2">
            {addItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} <br /> (x{item.quantity})
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* <hr className="my-2" /> */}

          {/* Subtotal, Pengiriman, Diskon, dan Total */}
          {/* <div className="flex justify-between text-sm">
              <p>Subtotal</p>
              <p>{formatCurrency(total)}</p>
            </div> */}

          <hr className="my-2" />

          <div className="flex justify-between text-sm font-semibold">
            <p>Total</p>
            <p>{formatCurrency(total)}</p>{" "}
            {/* Total setelah diskon dan pengiriman */}
          </div>

          <hr className="my-2" />

          {/* Metode Pembayaran */}
          <div className="text-start text-sm">
            <p>
              Metode Pembayaran: <b>{description}</b>
            </p>
            {/* <p>Bukti Pembayaran:</p>
              <div className="flex justify-center">
                <PhotoIcon className="w-6 h-6 text-gray-500" />
              </div> */}
          </div>

          <hr className="my-2" />

          {/* Footer */}
          <ReceiptFooter settings={receiptSettings} />

        </div>
      </div>
      <div className="receipt-actions"><button type="button" onClick={() => window.print()}>Cetak struk</button></div>
    </div>
  );
};

