import React, { useEffect } from "react";
import { formatCurrency } from "../../../utils";
import "../receipt.css";
import { Link } from "react-router-dom";
import { getReceiptSettings } from "../../../utils/receiptSettings";
import { ReceiptFooter, ReceiptHeader } from "../../../components/organisms/ReceiptSections";

export const Payment = () => {
  const receiptSettings = getReceiptSettings();
  const date = new Date();
  const transactionCode = sessionStorage.getItem("transactionCode");
  const addedItems = JSON.parse(sessionStorage.getItem("addedItems") || "[]");
  const total = sessionStorage.getItem("total");
  const description = sessionStorage.getItem("description");
  const customer = sessionStorage.getItem("customers");
  const pelanggan = sessionStorage.getItem("pelanggan");
  const hutang = sessionStorage.getItem("hutang");
  const diskon = sessionStorage.getItem("discount");
  const note = sessionStorage.getItem("note");

  console.log("addedItems:", addedItems);
  console.log("total:", total);
  console.log("descriptions:", description);
  console.log("customerName:", customer);
  console.log("customerNonVip:", pelanggan);
  console.log("Hutang:", hutang);
  console.log("diskon: ", diskon);
  console.log("note", note);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handlePrint = () => {
    const printContents = document.getElementById("print-content").innerHTML;
    const printWindow = window.open("", "", "width=600,height=800");

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk</title>
          <style>
            @page { margin: 7mm; }
            body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 0; font-size: 12px; line-height: 1.5; color: #111; }
            hr { border: 0; border-top: 1px dashed #999; margin: 10px 0; }
            h1, p { margin: 0 0 4px; }
            .text-center {
              text-align: center;
            }
            .text-start {
              text-align: left;
            }
            .flex { display: flex; justify-content: space-between; gap: 8px; }
            .gap-2 {
              gap: 8px;
            }
            .my-2 {
              margin-top: 8px;
              margin-bottom: 8px;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: 700;
            }
            .text-xs {
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close(); // Penting untuk menyelesaikan proses dokumen
    printWindow.document.title = receiptSettings.receiptTitle;
    printWindow.focus();
    printWindow.print(); // Melakukan print
  };

  if (!transactionCode && addedItems.length === 0) {
    return <div className="receipt-page"><div className="receipt-empty"><h1>Struk belum tersedia</h1><p>Selesaikan transaksi terlebih dahulu untuk melihat dan mencetak struk.</p><Link to="/transaksi/eceran">Mulai transaksi</Link></div></div>;
  }

  return (
    <div className="receipt-page">
      <div className="receipt-page__intro"><h1>Struk transaksi</h1><p>Periksa rincian sebelum mencetak.</p></div>
      <div className="w-full flex justify-center">
        <div
          id="print-content"
          className="receipt-card flex flex-col"
        >
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
              <p className="text-xs">
                Pelanggan:
                <b>
                  {customer && customer !== "Error"
                    ? customer
                    : pelanggan && pelanggan !== "Error"
                    ? pelanggan
                    : "Data tidak tersedia"}
                </b>
              </p>

              <p className="text-xs">{formatTanggal(date)}</p>
              {/* <p className="text-xs">{formatTime(date)}</p> */}
            </div>
          </div>

          <hr className="my-2" />

          {/* Rincian Pembelian */}
          <div className="w-full flex flex-col gap-2">
            {addedItems.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <div className=""></div>
                <div className="w-full items-start justify-start flex flex-col">
                  <span>
                    (x{item.quantity}) {item.name}
                  </span>
                  <p>{formatCurrency(item.price_ecer || item.price_grosir)}</p>
                </div>
                <span>
                  {formatCurrency(
                    (item.price || item.price_ecer || item.price_grosir) *
                      item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-2" />
          <div className="flex justify-between text-sm">
            <p>diskon</p>
            <p>-{formatCurrency(diskon)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>Total</p>
            <p>{formatCurrency(total)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>Hutang</p>
            <p>{formatCurrency(hutang)}</p>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <p>Total Bayar</p>
            <p>{formatCurrency(total - hutang - diskon)}</p>
          </div>

          <hr className="my-2" />

          {/* Metode Pembayaran */}
          <div className="text-start text-sm flex items-center gap-2">
            <p>Metode Pembayaran:</p>
            <p>
              <b>{description}</b>
            </p>
          </div>
          <div className="italic font-bold text-start text-sm flex items-center justify-between">
            <p>Note:</p>
            <p>
              <b>{note}</b>
            </p>
          </div>

          <hr className="my-2" />

          {/* Footer */}
          <ReceiptFooter settings={receiptSettings} />
        </div>
      </div>

      <div className="receipt-actions">
        <button
          onClick={handlePrint}
          className="receipt-print-button"
        >
          Cetak Struk
        </button>
      </div>
    </div>
  );
};

const formatTanggal = (date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString();
};
