import React, { useEffect, useState } from "react";
import { ContentLayout } from "../../../components/organisms/ContentLayout";
import { ButtonIcon } from "../../../components/molecules/ButtonIcon";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addOutbond,
  addTransaction,
  addTransactionNonVip,
  getAllCustomerTransactions,
} from "../../../api/api";
import { formatCurrency } from "../../../utils";
import { generateTransactionCode } from "../../../utils/receiptSettings";

export const AddTransactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addedItems } = location.state || {};
  const [isOn, setIson] = useState(true);
  const [isOnState, setIsOnState] = useState("Belum Lunas");
  const [statusPembayaran, setStatusPembayaran] = useState("Belum Lunas");
  const [loading, setLoading] = useState(false);
  const [pelanggan, setPelanggan] = useState("");
  const [customers, setCustomers] = useState([]);
  const [hutang, setHutang] = useState(0);
  const [message, setMessage] = useState("");

  const [transactionCode, setTransactionCode] = useState("");
  const [customerId, setCustomerId] = useState(null); //ubah jadi number
  const [total, setTotal] = useState(0);
  const [item, setItem] = useState("");
  const [descriptions, setDescriptions] = useState("");

  const handleToggleStatus = () => {
    setIsOnState((prev) => !prev);
    setStatusPembayaran((prev) => (prev === true ? false : true));
  };

  const filteredItems =
    addedItems?.filter((item) => item.id && item.quantity > 0) || [];

  // console.log("filter data addItems",filteredItems);

  const handlePayment = (e) => {
    setDescriptions(e.target.value);
  };

  const handleToggle = () => {
    setIson(!isOn);
  };

  const handleToggleState = () => {
    setIsOnState(!isOnState);
  };

  const handleCustomer = (e) => {
    setPelanggan(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const customerName = isOn
      ? customers.find((customer) => Number(customer.id) === Number(customerId))
          ?.name
      : "Error";

    const customerNameNonVip = !isOn ? pelanggan : "";

    console.log("customerVIP", customerName);
    console.log("nonVIPCustomer", customerNameNonVip);

    if (isOn) {
      sessionStorage.setItem("customers", customerName);
    }

    if (!isOn) {
      sessionStorage.setItem("pelanggan", customerNameNonVip);
    }

    const lunas = isOnState ? true : false;

    const payloadNonVip = {
      transactionCode: transactionCode,
      customer: pelanggan,
      total: calculateTotal(),
      items: addedItems?.map((item) => ({
        product_id: item.id,
        amount: item.quantity,
        total:
          item.price * item.quantity ||
          item.price_grosir * item.quantity ||
          item.price_ecer * item.quantity,
      })),
      description: descriptions,
      hutang: hutang,
      lunas: lunas,
    };

    const payload = {
      transactionCode: transactionCode,
      customerId: customerId,
      total: calculateTotal(),
      items: addedItems?.map((item) => ({
        product_id: item.id,
        amount: item.quantity,
        total:
          item.price * item.quantity ||
          item.price_grosir * item.quantity ||
          item.price_ecer * item.quantity,
      })),
      description: descriptions,
      hutang: hutang,
      lunas: lunas,
    };

    // console.log(JSON.stringify(payload, null, 2));

    const payloadOutbond = {
      customer: pelanggan || customerId, //customer string
      transactionCode: transactionCode,
      items: addedItems?.map((item) => ({
        product_id: item.id,
        amount: item.quantity,
        total:
          item.price * item.quantity ||
          item.price_grosir * item.quantity ||
          item.price_ecer * item.quantity,
        hutang: hutang,
        keterangan: descriptions,
      })),
    };

    // console.log(JSON.stringify(payloadOutbond, null, 2));

    if (isOn === true) {
      try {
        const result = await addTransaction(payload);
        if (
          result.data.meta.code === 201 &&
          result.data.meta.status === "success"
        ) {
          setMessage(
            `Transaksi Berhasil dibuat: ${result.data.transactionCode}`
          );
          sessionStorage.setItem("transactionCode", transactionCode);
          sessionStorage.setItem("addedItems", JSON.stringify(addedItems));
          sessionStorage.setItem("total", calculateTotal());
          sessionStorage.setItem("description", descriptions);
          sessionStorage.setItem("hutang", hutang);

          setTimeout(() => {
            window.open("/transaksi/pembayaran");
            navigate("/dashboard");
            sessionStorage.clear();
          }, 100);
        } else {
          setMessage("Transaksi gagal dibuat");
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    } else if (!isOn) {
      try {
        //retail
        const result = await addTransactionNonVip(payloadNonVip);
        if (
          result.data.meta.code === 201 &&
          result.data.meta.status === "success"
        ) {
          setMessage(
            `Transaksi Berhasil dibuat: ${result.data.transactionCode}`
          );
          sessionStorage.setItem("transactionCode", transactionCode);
          sessionStorage.setItem("addedItems", JSON.stringify(addedItems));
          sessionStorage.setItem("total", calculateTotal());
          sessionStorage.setItem("description", descriptions);
          sessionStorage.setItem("hutang", hutang);
          setTimeout(() => {
            window.open("/transaksi/pembayaran");
            navigate("/dashboard");
          }, 100);
        } else {
          setMessage("Transaksi gagal dibuat");
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    }

    try {
      const result = await addOutbond(payloadOutbond);
      if (
        result.data.meta.code === 201 &&
        result.data.meta.status === "success"
      ) {
        setMessage(`Transaksi Berhasil dibuat: ${result.data.transactionCode}`);
      } else {
        setMessage("Transaksi gagal dibuat");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Error during transaction process:", error);
    }
  };

  const calculateTotal = () => {
    return addedItems?.reduce((total, item) => {
      const price =
        (item.price || item.price_grosir || item.price_ecer) &&
        !isNaN(item.price || item.price_grosir || item.price_ecer)
          ? Number(item.price || item.price_grosir || item.price_ecer)
          : 0;
      return total + price * item.quantity;
    }, 0);
  };

  useEffect(() => {
    setTransactionCode(generateTransactionCode());
  }, []);

  useEffect(() => {
    if (isOn) {
      const fetchCustomers = async () => {
        setLoading(true);
        try {
          const response = await getAllCustomerTransactions();
          setCustomers(response);
        } catch (error) {
          console.error("Error fetching customers:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCustomers();
    }
  }, [isOn, isOnState]);

  return (
    <div>
      <ContentLayout>
        <div className="mb-12 pb-4">
          <div className="p-6 w-fit">
            <ButtonIcon
              icon={
                <ChevronLeftIcon className="h-6 max-md:h-4 text-orange-500" />
              }
              title="Kembali"
              titleColor="text-orange-600 font-semibold text-base max-md:text-xs"
              showArrow={false}
              linkTo="/dashboard"
            />
          </div>

          <hr className="mx-3" />
          <form action="" onSubmit={handleSubmit}>
            <div className="mt-4 grid grid-cols-2 max-md:grid-cols-1 px-6 gap-8">
              <div className="mx-2 w-full flex flex-col gap-10 pr-6 border-r-2">
                <div className="w-full flex flex-col gap-6">
                  <h1 className="text-xl max-md:text-lg  font-bold">
                    Informasi Pelanggan
                  </h1>
                  <div className="w-full flex text-nowrap max-md:text-xs max-md:text-wrap">
                    <p>Apakah Pelanggan Sudah Terdaftar</p>
                    <div
                      className={`w-full justify-end relative inline-flex items-center cursor-pointer ${
                        isOn ? "justify-end" : "justify-start"
                      }`}
                      onClick={handleToggle}
                    >
                      <span
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          isOn ? "bg-orange-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                            isOn ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-base max-md:text-xs font-bold">
                      {isOn ? "Pilih Pelanggan" : "Nama Pelanggan"}
                    </label>

                    {isOn ? (
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="px-4 py-2 max-md:text-xs border-2 rounded"
                        required
                      >
                        <option>Pilih Pelanggan</option>
                        {loading ? (
                          <option value="" disabled>
                            Loading...
                          </option>
                        ) : (
                          customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={pelanggan}
                        onChange={handleCustomer}
                        className="px-4 py-2 border-2 rounded max-md:text-xs"
                        placeholder="Masukkan Nama Pelanggan"
                      />
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <label htmlFor="" className="max-md:text-xs font-bold">
                    Kode Transaksi
                  </label>
                  <input
                    type="text"
                    className="px-4 py-2 border-2 rounded max-md:text-xs"
                    placeholder="Masukkan Kode Transaksi"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    disabled
                  />
                </div>

                <div className="w-full flex gap-1">
                  <div className="w-full flex flex-col gap-1">
                    <div className="w-full flex flex-col gap-1">
                      <label htmlFor="" className="max-md:text-xs font-bold">
                        Hutang
                      </label>
                      <input
                        type="number"
                        value={isOnState ? 0 : hutang || ""}
                        onChange={(e) => setHutang(e.target.value)}
                        className="px-4 py-2 border-2 rounded max-md:text-xs"
                        placeholder="Masukkan Hutang"
                        disabled={isOnState} // Disable the input when 'Lunas' (isOnState is true)
                      />
                    </div>
                    <div
                      className={`w-full justify-start mt-6 relative inline-flex items-center cursor-pointer gap-3 ${
                        isOnState ? "justify-start" : "justify-start"
                      }`}
                      onClick={handleToggleStatus}
                    >
                      <span
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          isOnState ? "bg-orange-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                            isOnState ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </span>

                      {isOnState ? (
                        <p className="mr-2">Lunas</p>
                      ) : (
                        <p className="mr-2">Belum Lunas</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* <div className="w-full flex flex-col gap-6">
                <h1 className="text-xl font-bold">Informasi Transaksi</h1>
                <div className="w-full">
                  <h1>Jenis Transaksi</h1>
                  <div className="w-full flex gap-4">
                    <div className="w-full p-4 flex gap-2 items-center justify-start border-2 rounded-lg">
                      <input
                        type="radio"
                        name="transaksi"
                        value={"Ambil Ditempat"}
                        className="w-4 h-4 focus:ring-orange-600"
                      />
                      <label htmlFor="">Ambil Ditempat</label>
                    </div>

                    <div className="w-full p-4 flex gap-2 items-center justify-start border-2 rounded-lg">
                      <input
                        type="radio"
                        name="transaksi"
                        value={"Kirim ke Alamat"}
                        className="w-4 h-4 focus:ring-orange-600"
                      />
                      <label htmlFor="">Kirim ke Alamat</label>
                    </div>
                  </div>
                </div>
              </div> */}

                <div className="w-full flex flex-col gap-6">
                  <h1 className="text-xl max-md:text-lg font-bold">
                    Informasi Pembayaran
                  </h1>
                  <div className="w-full max-md:text-xs">
                    <h1>Metode Pembayaran</h1>
                    <div className="w-full flex gap-4 text-sm font-semibold max-md:grid">
                      <div
                        className="w-full max-md:text-xs px-2 py-4 flex gap-2 items-center justify-start border-2 rounded-lg"
                        onClick={() => document.getElementById("tunai").click()} // Menambahkan handler klik
                      >
                        <input
                          id="tunai"
                          type="radio"
                          name="pembayaran"
                          value="Tunai"
                          checked={descriptions === "Tunai"} // Cek jika ini yang dipilih
                          onChange={handlePayment} // Update state ketika dipilih
                          className="w-4 h-4 max-md:w-3 max-md:h-3 focus:ring-orange-600"
                        />
                        <label htmlFor="tunai">Tunai</label>
                      </div>

                      <div
                        className="w-full max-md:text-xs px-2 py-4 flex gap-2 items-center justify-start border-2 rounded-lg"
                        onClick={() =>
                          document.getElementById("transfer").click()
                        }
                      >
                        <input
                          id="transfer"
                          type="radio"
                          name="pembayaran"
                          value="Transfer"
                          checked={descriptions === "Transfer"}
                          onChange={handlePayment}
                          className="w-4 h-4 max-md:w-3 max-md:h-3 focus:ring-orange-600"
                        />
                        <label htmlFor="transfer">Transfer</label>
                      </div>

                      <div
                        className="w-full max-md:text-xs px-2 py-4 flex gap-2 items-center justify-start border-2 rounded-lg"
                        onClick={() => document.getElementById("qris").click()}
                      >
                        <input
                          id="qris"
                          type="radio"
                          name="pembayaran"
                          value="Qris"
                          checked={descriptions === "Qris"}
                          onChange={handlePayment}
                          className="w-4 h-4 max-md:w-3 max-md:h-3 focus:ring-orange-600"
                        />
                        <label htmlFor="qris">Qris</label>
                      </div>

                      <div
                        className="w-full max-md:text-xs px-2 py-4 flex gap-2 items-center justify-start border-2 rounded-lg"
                        onClick={() => document.getElementById("debit").click()}
                      >
                        <input
                          id="debit"
                          type="radio"
                          name="pembayaran"
                          value="Debit"
                          checked={descriptions === "Debit"}
                          onChange={handlePayment}
                          className="w-4 h-4 max-md:w-3 max-md:h-3 focus:ring-orange-600"
                        />
                        <label htmlFor="debit">Debit</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-2 w-full flex flex-col gap-8">
                <h1 className="text-xl max-md:text-lg font-bold">
                  Rincian Pesanan
                </h1>
                <div className="">
                  <div className="w-fullm max-md:text-[10px] flex items-center justify-start gap-4">
                    <div className="w-full">
                      <ul>
                        {addedItems?.length > 0 ? (
                          addedItems.map((item, index) => (
                            <li key={index}>
                              <div className="w-full flex items-center justify-between">
                                <p className="">
                                  {`(x${item.quantity})`} {item.name}
                                </p>
                                <div className="">
                                  {formatCurrency(
                                    (item.price ||
                                      item.price_grosir * item.quantity ||
                                      item.price_ecer * item.quantity) *
                                      item.quantity
                                  )}
                                </div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <p>No items added</p>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="w-full text-sm max-md:text-xs">
                  <div className="w-full flex justify-between">
                    <p className="font-normal text-[#334155]">SubTotal</p>
                    <h1 className="font-semibold text-[#1E293B]">
                      {formatCurrency(calculateTotal())}
                    </h1>
                  </div>
                  {/* <div className="w-full flex justify-between">
                  <p className="font-normal text-[#334155]">Pengiriman</p>
                  <h1 className="font-semibold text-[#1E293B]">
                    {formatCurrency(50000)}
                  </h1>
                </div> */}
                  {/* <div className="w-full flex justify-between">
                  <p className="font-normal text-[#334155]">Diskon (5%)</p>
                  <h1 className="font-semibold text-[#1E293B]">
                    {formatCurrency(-100000)}
                  </h1>
                </div> */}
                  <hr className="mt-4" />
                  <div className="w-full flex justify-between text-lg max-md:text-sm font-semibold">
                    <p>Total</p>
                    <h1>{formatCurrency(calculateTotal())}</h1>{" "}
                    {/* Total setelah diskon dan pengiriman */}
                  </div>
                </div>
                <div className="w-full">
                  {/* <Link to="/transaksi/pembayaran"> */}
                  <button
                    type="submit"
                    className="w-full rounded-full bg-orange-600 py-4 px-10 font-semibold text-base max-md:text-xs text-white"
                  >
                    Cetak Struk
                  </button>
                  {/* </Link> */}
                </div>
              </div>
            </div>
          </form>
        </div>
      </ContentLayout>
    </div>
  );
};
