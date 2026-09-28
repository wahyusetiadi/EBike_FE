const STORAGE_KEY = "ebike.receipt-settings.v1";

export const DEFAULT_RECEIPT_SETTINGS = Object.freeze({
  storeName: "E-Bike Management",
  address: "Jl. Veteran No. 123",
  phone: "0812-3456-7890",
  website: "www.ebikemanagement.com",
  receiptTitle: "Struk Pembelian",
  footerNote: "Pastikan untuk menyimpan struk ini sebagai bukti transaksi.",
  transactionPrefix: "GMJ",
});

const limits = {
  storeName: 80,
  address: 160,
  phone: 50,
  website: 100,
  receiptTitle: 80,
  footerNote: 180,
};

export const normalizeReceiptSettings = (values = {}) => {
  const normalized = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = typeof values[key] === "string" ? values[key] : DEFAULT_RECEIPT_SETTINGS[key];
    normalized[key] = value.trim().slice(0, limit);
  }
  normalized.storeName ||= DEFAULT_RECEIPT_SETTINGS.storeName;
  normalized.receiptTitle ||= DEFAULT_RECEIPT_SETTINGS.receiptTitle;
  normalized.transactionPrefix =
    String(values.transactionPrefix ?? DEFAULT_RECEIPT_SETTINGS.transactionPrefix)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12) || DEFAULT_RECEIPT_SETTINGS.transactionPrefix;
  return normalized;
};

export const getReceiptSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return normalizeReceiptSettings(saved && typeof saved === "object" ? saved : {});
  } catch {
    return { ...DEFAULT_RECEIPT_SETTINGS };
  }
};

export const saveReceiptSettings = (values) => {
  const normalized = normalizeReceiptSettings(values);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const resetReceiptSettings = () => {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_RECEIPT_SETTINGS };
};

const cleanPrefix = (prefix) =>
  String(prefix).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || DEFAULT_RECEIPT_SETTINGS.transactionPrefix;

const transactionDatePart = (date) =>
  `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

export const exampleTransactionCode = (prefix) =>
  `${cleanPrefix(prefix)}-${transactionDatePart(new Date())}-123456`;

export const generateTransactionCode = (prefix = getReceiptSettings().transactionPrefix) => {
  const date = new Date();
  const randomPart = Math.floor(Math.random() * 1000000);
  return `${cleanPrefix(prefix)}-${transactionDatePart(date)}-${randomPart}`;
};
