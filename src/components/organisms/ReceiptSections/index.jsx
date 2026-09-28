import React from "react";

export const ReceiptHeader = ({ settings }) => (
  <div className="text-center">
    <h1 className="font-bold">{settings.storeName}</h1>
    {settings.address && <p>{settings.address}</p>}
    {settings.phone && <p>Telp: {settings.phone}</p>}
  </div>
);

export const ReceiptFooter = ({ settings }) => (
  <div className="text-center text-xs text-gray-600">
    <p>Terima kasih telah berbelanja di <br /> {settings.storeName}</p>
    {settings.website && <p>{settings.website}</p>}
    {settings.footerNote && <p>{settings.footerNote}</p>}
  </div>
);
