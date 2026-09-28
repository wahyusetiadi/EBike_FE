import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArchiveBoxIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getUser } from "../../../api/api";
import { ClipLoader } from "react-spinners";
import Logo from "../../../assets/logo.svg";
import "./style.css";

const mobileLinks = [
  { label: "Dashboard", to: "/dashboard", icon: Squares2X2Icon },
  { label: "Eceran", to: "/transaksi/eceran", icon: ShoppingBagIcon },
  { label: "Grosir", to: "/transaksi/grosir", icon: ShoppingBagIcon },
  { label: "Pelanggan", to: "/pelanggan", icon: UserGroupIcon },
  { label: "Riwayat transaksi", to: "/riwayat-transaksi", icon: ReceiptPercentIcon },
  { label: "Laporan barang keluar", to: "/laporan-barang-keluar", icon: ChartBarIcon },
  { label: "Pengaturan", to: "/pengaturan", icon: Cog6ToothIcon },
];

const sidebarLinks = [
  { label: "Dashboard", to: "/dashboard", icon: Squares2X2Icon },
  { label: "Barang", to: "/barang", icon: ArchiveBoxIcon, ownerOnly: true },
  { label: "Penjualan eceran", to: "/transaksi/eceran", icon: ShoppingBagIcon },
  { label: "Penjualan grosir", to: "/transaksi/grosir", icon: ShoppingBagIcon },
  { label: "Pelanggan", to: "/pelanggan", icon: UserGroupIcon },
  { label: "Riwayat transaksi", to: "/riwayat-transaksi", icon: ReceiptPercentIcon },
  { label: "Laporan barang keluar", to: "/laporan-barang-keluar", icon: ChartBarIcon },
  { label: "Pengaturan", to: "/pengaturan", icon: Cog6ToothIcon },
];

export const ContentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await getUser();
        if (mounted) setUser(userData);
      } catch (error) {
        console.error("Error get User Data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, [location]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const pageTitle = mobileLinks.find(({ to }) =>
    to === "/dashboard" ? location.pathname === to : location.pathname.startsWith(to),
  )?.label || "Menu";

  return (
    <div className="content-layout-shell">
      <aside className="content-layout-sidebar">
        <Link to="/dashboard" className="content-layout-side-brand">
          <img src={Logo} alt="" /><span>E-Bike <small>MANAGEMENT</small></span>
        </Link>
        <p className="content-layout-side-caption">MENU UTAMA</p>
        <nav className="content-layout-side-links" aria-label="Navigasi utama">
          {sidebarLinks.filter(({ ownerOnly }) => !ownerOnly || user?.role === "owner").map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `content-layout-side-link${isActive ? " is-active" : ""}`}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="content-layout-side-footer">
          {user?.username && <p>Login sebagai <b>{user.username}</b><small>{user.role}</small></p>}
          <button type="button" className="content-layout-side-link content-layout-side-logout" onClick={handleLogout}>
            <ArrowLeftOnRectangleIcon /><span>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="content-layout-main">
        <header className="content-layout-mobile-header">
          <Link to="/dashboard" className="content-layout-brand" aria-label="E-Bike dashboard">
            <img src={Logo} alt="" />
            <span>E-Bike</span>
          </Link>
          <span className="content-layout-current-page">{pageTitle}</span>
          <button
            type="button"
            className="content-layout-menu-toggle"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <XMarkIcon /> : <Bars3Icon />}
          </button>
        </header>

        {menuOpen && (
          <nav className="content-layout-mobile-menu" aria-label="Navigasi utama">
            <p className="content-layout-menu-caption">MENU UTAMA</p>
            {user?.role === "owner" && (
              <NavLink to="/barang" className={({ isActive }) => `content-layout-mobile-link${isActive ? " is-active" : ""}`}>
                <ArchiveBoxIcon /><span>Produk</span>
              </NavLink>
            )}
            {mobileLinks.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `content-layout-mobile-link${isActive ? " is-active" : ""}`}>
                <Icon /><span>{label}</span>
              </NavLink>
            ))}
            <button type="button" className="content-layout-mobile-link content-layout-logout" onClick={handleLogout}>
              <ArrowLeftOnRectangleIcon /><span>Keluar</span>
            </button>
            {user?.username && <p className="content-layout-user-label">Login sebagai <b>{user.username}</b></p>}
          </nav>
        )}

        <div className="content-layout-scroll">
          <div className="content-layout-surface">
            {loading ? (
              <div className="content-layout-loader"><ClipLoader color="#EA580C" size={42} /></div>
            ) : (
              <div key={location.pathname}>{children}</div>
            )}
          </div>
        </div>

        <nav className="content-layout-bottom-nav" aria-label="Navigasi cepat">
          {mobileLinks.slice(0, 1).map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `content-layout-dock-link${isActive ? " is-active" : ""}`}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
          {mobileLinks.slice(1, 3).map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `content-layout-dock-link${isActive ? " is-active" : ""}`}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/pelanggan" className={({ isActive }) => `content-layout-dock-link${isActive ? " is-active" : ""}`}>
            <UserGroupIcon /><span>Pelanggan</span>
          </NavLink>
          <button type="button" className={`content-layout-dock-link${menuOpen ? " is-active" : ""}`} onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
            {menuOpen ? <XMarkIcon /> : <Bars3Icon />}<span>Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
