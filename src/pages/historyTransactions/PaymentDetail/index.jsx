import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { getUser } from "../../../api/api";
import { formatCurrency } from "../../../utils";
import "../../Transactions/receipt.css";
import { getReceiptSettings } from "../../../utils/receiptSettings";
import { ReceiptFooter, ReceiptHeader } from "../../../components/organisms/ReceiptSections";

const PaymentPage = () => {
  const receiptSettings = getReceiptSettings();
  const [transactionData, setTransactionData] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil data dari sessionStorage
    const storedData = sessionStorage.getItem("transactionData");
    // console.log("storedData", storedData);

    if (storedData) {
      setTransactionData(JSON.parse(storedData));
    } else {
      navigate("/"); // Kembali ke halaman utama jika data tidak ditemukan
    }

    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error("Error GET userData");
        throw error;
      }
    };

    fetchUser();
  }, [navigate]);

  if (!transactionData) {
    return <div>Loading...</div>;
  }

  const {
    transactionCode,
    items,
    total,
    metodePembayaran,
    date,
    customer,
    hutang,
    discount,
    note,
  } = transactionData;

  console.log("transactions Data", transactionData);

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

  return (
    <div className="receipt-page">
      <div className="receipt-page__intro"><h1>Struk transaksi</h1><p>Periksa rincian sebelum mencetak.</p></div>
      <div
        className="receipt-card"
        id="print-content"
      >
        {/* Header struk */}
        <ReceiptHeader settings={receiptSettings} />
        <hr className="my-2" />
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
              Pelanggan: <b>{customer || "Error"}</b>
            </p>
            <p className="text-xs">{formatTanggal(date)}</p>
            {/* <p className="text-xs">{formatTime(date)}</p> */}
          </div>
        </div>
        <hr className="my-2" />

        {/* Daftar Barang */}
        <div className="w-full flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="w-full flex justify-between text-xs">
              <div className="w-full items-start justify-start flex flex-col">
                <span>
                  (x{item.amount}) {item.name}
                </span>
                <p>{formatCurrency((item.total)/(item.amount))}</p>
              </div>
              <span>{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>

        {/* Total dan Metode Pembayaran */}
        <div className="flex justify-between text-sm">
          <p>diskon</p>
          <p>-{formatCurrency(discount)}</p>
        </div>
        <div className="flex justify-between text-sm font-semibold my-2">
          <p className="total">Total:</p>
          <p>{formatCurrency(total)}</p>
        </div>
        <div className="flex justify-between text-sm font-semibold my-2">
          <p className="total">Hutang:</p>
          <p className="text-red-600">{formatCurrency(hutang)}</p>
        </div>
        <div className="flex justify-between text-sm font-semibold my-2">
          <p className="total">Total Bayar:</p>
          <p>{formatCurrency(total - hutang - discount)}</p>
        </div>
        <hr className="my-2" />

        <div className="flex justify-between text-start text-sm  ">
          <p>Metode Pembayaran:</p>
          <p>
            <b>{metodePembayaran}</b>
          </p>
        </div>
        <div className="italic font-bold text-start text-sm flex items-center justify-between">
          <p>Note:</p>
          <p>
            <b>{note}</b>
          </p>
        </div>
        <hr className="my-2" />

        <ReceiptFooter settings={receiptSettings} />
      </div>
      <div className="receipt-actions print-button-container">
        <button
          onClick={handlePrint}
          className="print-button"
        >
          Cetak Struk
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
