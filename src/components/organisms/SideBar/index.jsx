import React, { useEffect, useState } from "react";
import Logo from "../../../assets/logo.svg";

import {
  ArchiveBoxIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ButtonIcon } from "../../molecules/ButtonIcon";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { getUser } from "../../../api/api";

export const SideBar = ({ users, role, loggedInfo = false }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    // Cookies.remove("token", { path: '/'});
    // window.location.href = '/';
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/"); // Redirect to login page
  };

  const fetchUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error GET USER DATA:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAdminBesar = user?.role === "owner";
  const isAdminCabang = user?.role === "admin";

  return (
    <div className="sidebar-shell no-scrollbar">
      <div className="sidebar-brand">
        {/* Logo for large screens, switches between Logo2 and Logo based on isOpen */}
        {/* <img
          src={isOpen ? Logo : Logo2}
          alt="Logo"
          className="hidden lg:block xl:w-auto 2xl:max-w-[200px] max-h-[32px] mb-12"
        /> */}
        <button
          className="w-auto flex gap-2 items-center justify-center py-2"
          onClick={() => navigate("/dashboard")}
        >
          <img src={Logo} alt="" className="size-8" />
          <p className="text-orange-500 font-bold text-3xl hidden lg:block">
            E-Bike
          </p>
        </button>
        {/* <button className="lg:hidden" onClick={toggleSidebar}>
          <img
            src={isOpen ? Logo2 : Logo}
            alt="Logo"
            className="lg:hidden xl:w-auto 2xl:max-w-[200px] max-h-[32px] mb-12"
          />
        </button> */}
      </div>

      {/* Burger Menu Button for small screens */}
      {/* <button
        className="lg:hidden text-black focus:outline-none relative"
        onClick={toggleSidebar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button> */}

      {/* Sidebar Content */}
      {loggedInfo && (
        <div className="w-full text-black flex items-center gap-1 my-4">
          <p className="text-sm">Login As:</p>
          <p className="text-sm font-semibold">{users}</p>
          <p className="text-sm font-medium">({role})</p>
        </div>
      )}
      <div className="sidebar-menu">
        <div className="">
          <h1 className="text-base mb-4">Menu</h1>
          <div className="flex flex-col gap-4">
            <ButtonIcon
              icon={<Squares2X2Icon className="size-6" />}
              title="Dashboard"
              showArrow={false}
              classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
              linkTo="/dashboard"
              // linkTo='/'
            />
            {isAdminBesar && (
              <>
                <ButtonIcon
                  icon={<ArchiveBoxIcon className="w-6 h-6" />}
                  title="Barang"
                  showArrow={false}
                  classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
                  linkTo="/barang"
                />
              </>
            )}

            {/* {openDropdown && (
              <div className="">
                <ul className="text-sm ml-6">
                  <li className="mb-4">Sepeda Gunung</li>
                  <li className="mb-4">Sepeda BMX</li>
                  <li className="mb-4">Sepeda Anak</li>
                  <li className="mb-4">Sepeda Lipat</li>
                  <li className="mb-4">Sparepart</li>
                  <li className="mb-4">Aksesoris</li>
                </ul>
              </div>
            )} */}
            <ButtonIcon
              icon={<ShoppingBagIcon className="w-6 h-6" />}
              title="Transaksi"
              showArrow={false}
              classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
              onClick={toggleDropdown}
            />
            {openDropdown && (
              <div className="">
                <ul className="text-sm ml-6">
                  <li className="mb-4">
                    <ButtonIcon
                      title="Grosir"
                      showArrow={false}
                      classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
                      linkTo="/transaksi/grosir"
                    />
                  </li>
                  <li className="mb-4">
                    <ButtonIcon
                      title="Eceran"
                      showArrow={false}
                      classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
                      linkTo="/transaksi/eceran"
                    />
                  </li>
                </ul>
              </div>
            )}
            <ButtonIcon
              icon={<UserGroupIcon className="w-6 h-6" />}
              title="Pelanggan"
              showArrow={false}
              classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
              linkTo="/pelanggan"
            />
            <ButtonIcon
              icon={<ReceiptPercentIcon className="size-6" />}
              title="Riwayat Transaksi"
              showArrow={false}
              classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
              linkTo="/riwayat-transaksi"
            />
            <ButtonIcon
              icon={<ChartBarIcon className="size-6" />}
              title="Laporan Barang Keluar"
              showArrow={false}
              classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
              linkTo="/laporan-barang-keluar"
            />
            <ButtonIcon
              icon={
                <ArrowLeftOnRectangleIcon className="size-6 text-red-500" />
              }
              titleColor={"text-red-500"}
              title="Log Out"
              showArrow={false}
              classNameBtn="focus:bg-orange-200 focus:text-orange-600 hover:bg-orange-200 hover:text-orange-600 px-2 py-1"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
