import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArchiveBoxIcon,
  ArrowUpRightIcon,
  BanknotesIcon,
  ClockIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ContentLayout } from "../../components/organisms/ContentLayout";
import {
  getAllCustomerData,
  getAllHistoryTransactions,
  getAllProducts,
  getAllTransactions,
  getUser,
} from "../../api/api";
import "./style.css";

export const Dashboard = () => {
  const [counts, setCounts] = useState({ products: 0, transactions: 0, customers: 0, history: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const [userResult, products, transactions, customers, history] =
        await Promise.allSettled([
          getUser(),
          getAllProducts(),
          getAllTransactions(),
          getAllCustomerData(),
          getAllHistoryTransactions(),
        ]);

      if (userResult.status === "fulfilled") setUser(userResult.value);

      const countOf = (result) =>
        result.status === "fulfilled" && Array.isArray(result.value)
          ? result.value.length
          : 0;

      setCounts({
        products: countOf(products),
        transactions: countOf(transactions),
        customers: countOf(customers),
        history: countOf(history),
      });
    };

    loadDashboard();
  }, []);

  const isOwner = user?.role === "owner";
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const stats = [
    ...(isOwner
      ? [{ label: "Produk terdaftar", value: counts.products, suffix: "produk", icon: ArchiveBoxIcon, tone: "orange" }]
      : []),
    { label: "Total transaksi", value: counts.transactions, suffix: "transaksi", icon: ShoppingCartIcon, tone: "green" },
    { label: "Pelanggan", value: counts.customers, suffix: "pelanggan", icon: UserGroupIcon, tone: "blue" },
    { label: "Riwayat penjualan", value: counts.history, suffix: "catatan", icon: ReceiptPercentIcon, tone: "violet" },
  ];

  return (
    <ContentLayout>
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date"><ClockIcon /> {today}</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Selamat datang{user?.username ? `, ${user.username}` : ""}. Ini ringkasan operasional toko Anda.
          </p>
        </div>
      </header>

      <section className="dashboard-pos-banner" aria-label="Akses kasir cepat">
        <div className="dashboard-banner-copy">
          <span className="dashboard-banner-eyebrow"><span /> SIAP MELAYANI</span>
          <h2>Mulai transaksi penjualan</h2>
          <p>Pilih jenis transaksi dan lanjutkan ke halaman kasir.</p>
        </div>
        <div className="dashboard-banner-actions">
          <Link to="/transaksi/tambah-transaksi-ecer" className="dashboard-sale-link dashboard-sale-link-light">
            <span className="dashboard-sale-icon"><ShoppingCartIcon /></span>
            <span><b>Penjualan eceran</b><small>Transaksi retail</small></span>
            <ArrowUpRightIcon className="dashboard-sale-arrow" />
          </Link>
          <Link to="/transaksi/tambah-transaksi-grosir" className="dashboard-sale-link dashboard-sale-link-dark">
            <span className="dashboard-sale-icon"><BanknotesIcon /></span>
            <span><b>Penjualan grosir</b><small>Transaksi partai</small></span>
            <ArrowUpRightIcon className="dashboard-sale-arrow" />
          </Link>
        </div>
        <div className="dashboard-banner-orb dashboard-banner-orb-one" />
        <div className="dashboard-banner-orb dashboard-banner-orb-two" />
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div><h2>Ringkasan toko</h2><p>Pantau data utama toko Anda.</p></div>
        </div>
        <div className="dashboard-stat-grid">
          {stats.map(({ label, value, suffix, icon: Icon, tone }) => (
            <article className="dashboard-stat-card" key={label}>
              <div className={`dashboard-stat-icon dashboard-tone-${tone}`}><Icon /></div>
              <div className="dashboard-stat-content">
                <p>{label}</p>
                <div><strong>{value.toLocaleString("id-ID")}</strong><span>{suffix}</span></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
    </ContentLayout>
  );
};
