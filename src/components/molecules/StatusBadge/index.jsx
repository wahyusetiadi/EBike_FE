import "./style.css";

const successValues = new Set(["selesai", "sukses", "tersedia", "available", "lunas"]);
const warningValues = new Set(["non-active", "tidak tersedia", "belum", "belum lunas"]);
const dangerValues = new Set(["gagal", "stok habis", "stock habis"]);

export const StatusBadge = ({ label, tone }) => {
  const normalized = String(label ?? "").toLowerCase();
  const resolvedTone = tone || (
    successValues.has(normalized) ? "success" :
    warningValues.has(normalized) ? "warning" :
    dangerValues.has(normalized) ? "danger" : "neutral"
  );

  return <span className={`status-badge status-badge--${resolvedTone}`}>{label || "–"}</span>;
};
