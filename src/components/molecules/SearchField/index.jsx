import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const SeacrhField = ({ serachQuery, onSearchChange }) => {
  return (
    <div className="w-full flex flex-col justify-center">
      <div className="flex gap-3 items-center min-h-11 border border-[#dce5e1] rounded-xl bg-white px-3 transition-colors focus-within:border-[#428b6e] focus-within:ring-2 focus-within:ring-[#428b6e]/20">
        <MagnifyingGlassIcon className="w-5 h-5 text-[#718b80] shrink-0" />
        <input
          type="text"
          aria-label="Cari data"
          placeholder="Cari nama atau kode..."
          value={serachQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-w-0 py-2 bg-transparent focus:outline-none text-sm text-[#203b34] placeholder:text-[#8a9f96]"
        />
        {serachQuery && <button type="button" aria-label="Hapus pencarian" onClick={() => onSearchChange("")} className="text-xs font-semibold text-[#56786a] hover:text-[#174d39]">Hapus</button>}
      </div>
    </div>
  );
};
