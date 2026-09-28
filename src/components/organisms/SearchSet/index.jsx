import React, { useEffect, useRef, useState } from "react";
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { SeacrhField } from "../../molecules/SearchField";
import "./style.css";

export const SearchSet = ({ onSearchChange, filterStatus, filterKategori, sortedData, onFilterChange, onSortChange }) => {
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const toolbarRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!toolbarRef.current?.contains(event.target)) setOpenFilter(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const changeFilter = (type, value) => {
    const nextValue = type === "status"
      ? (selectedStatus === value ? "" : value)
      : (selectedKategori === value ? "" : value);
    if (type === "status") setSelectedStatus(nextValue);
    else setSelectedKategori(nextValue);
    onFilterChange?.(type, nextValue);
    setOpenFilter(null);
  };

  const sort = (direction) => {
    setSortDirection(direction);
    onSortChange?.(direction);
    setOpenFilter(null);
  };

  return (
    <div className="search-toolbar" ref={toolbarRef}>
      <SeacrhField serachQuery={query} onSearchChange={(value) => { setQuery(value); onSearchChange?.(value); }} />
      {(filterStatus || filterKategori || sortedData) && (
        <div className="search-toolbar__filters" aria-label="Filter dan urutan data">
          {filterStatus && (
            <div className="search-toolbar__filter">
              <button type="button" className="search-toolbar__trigger" aria-expanded={openFilter === "status"} onClick={() => setOpenFilter(openFilter === "status" ? null : "status")}>{selectedStatus || "Status"}<ChevronDownIcon /></button>
              {openFilter === "status" && <div className="search-toolbar__menu">
                {["Tersedia", "Tidak Tersedia"].map((value) => <button type="button" key={value} aria-pressed={selectedStatus === value} onClick={() => changeFilter("status", value)}>{value}</button>)}
              </div>}
            </div>
          )}
          {filterKategori && (
            <div className="search-toolbar__filter">
              <button type="button" className="search-toolbar__trigger" aria-expanded={openFilter === "kategori"} onClick={() => setOpenFilter(openFilter === "kategori" ? null : "kategori")}>{selectedKategori === "SEPEDA" ? "Sepeda" : selectedKategori === "SPAREPART" ? "Sparepart" : "Kategori"}<ChevronDownIcon /></button>
              {openFilter === "kategori" && <div className="search-toolbar__menu">
                {[["SEPEDA", "Sepeda"], ["SPAREPART", "Sparepart"]].map(([value, label]) => <button type="button" key={value} aria-pressed={selectedKategori === value} onClick={() => changeFilter("kategori", value)}>{label}</button>)}
              </div>}
            </div>
          )}
          {sortedData && (
            <div className="search-toolbar__filter">
              <button type="button" className="search-toolbar__trigger" aria-expanded={openFilter === "sort"} onClick={() => setOpenFilter(openFilter === "sort" ? null : "sort")}><AdjustmentsHorizontalIcon />{sortDirection === "asc" ? "A–Z" : sortDirection === "desc" ? "Z–A" : "Urutkan"}<ChevronDownIcon /></button>
              {openFilter === "sort" && <div className="search-toolbar__menu">
                <button type="button" aria-pressed={sortDirection === "asc"} onClick={() => sort("asc")}>Nama A–Z</button>
                <button type="button" aria-pressed={sortDirection === "desc"} onClick={() => sort("desc")}>Nama Z–A</button>
              </div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
