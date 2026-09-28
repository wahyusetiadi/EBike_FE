import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContentLayout } from "../../../components/organisms/ContentLayout";
import { TableData } from "../../../components/organisms/TableData";
import { getAllProductsGrosir } from "../../../api/api";
import { TransactionCart } from "../../../components/organisms/TransactionCart";
import "../checkout.css";

export const TransactionsGrosir = () => {
  const [barang, setBarang] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [addedItems, setAddedItems] = useState([]);
  const [reloadKey, setReloadKey] = useState(0); // State untuk memaksa re-render
  const navigate = useNavigate();

  // Fetch all products
  useEffect(() => {
    const fetchDataBarang = async () => {
      try {
        const data = await getAllProductsGrosir();
        // console.log("databarang Grosir:", data);
        setBarang(data);
      } catch (error) {
        console.error("Error fetching data barang Grosir:", error);
      }
    };

    fetchDataBarang();
  }, [reloadKey]); // Fetch ulang produk saat reloadKey berubah

  useEffect(() => {
    const hasItems = addedItems.some((item) => item.quantity > 0);
    setShowCheckout(hasItems);
  }, [addedItems]);

  // Show checkout if there are items in the cart
  useEffect(() => {
    const hasItems = addedItems.some((item) => item.quantity > 0);
    setShowCheckout(hasItems);
  }, [addedItems]);

  const handleAddItem = (item) => {
    setAddedItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (prevItem) => prevItem.id === item.id
      );

      let updatedItems = [...prevItems];

      if (existingItemIndex >= 0) {
        updatedItems[existingItemIndex] = item;
      } else if (item.quantity > 0) {
        updatedItems.push(item);
      }

      // Hapus item dengan quantity 0
      return updatedItems.filter((item) => item.quantity > 0);
    });
  };
  const handleIncrease = (item) => {
    setAddedItems((prevItems) => {
      return prevItems.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, quantity: prevItem.quantity + 1 }
          : prevItem
      );
    });
  };

  const handleDecrease = (item) => {
    setAddedItems((prevItems) => {
      return prevItems
        .map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, quantity: prevItem.quantity - 1 }
            : prevItem
        )
        .filter((item) => item.quantity > 0);
    });
  };
  // Reset cart and hide checkout
  const handleReset = () => {
    setAddedItems([]); // Reset added items
    setShowCheckout(false); // Hide checkout
    setReloadKey((prevKey) => prevKey + 1); // Trigger re-render of ContentLayout by updating reloadKey
  };

  const calculateTotalPrice = () => {
    return addedItems.reduce((total, item) => {
      const harga =
        item.price_grosir && !isNaN(item.price_grosir)
          ? Number(item.price_grosir)
          : 0;
      return total + harga * item.quantity;
    }, 0);
  };

  const calculateTotalItems = () => {
    return addedItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate("/transaksi/tambah-transaksi-grosir", {
      state: { addedItems },
    });
  };

  return (
    <div>
      <ContentLayout key={reloadKey}>
        <div className="checkout-catalog pb-2 mb-12">
          <div className="w-full py-4 px-6 flex max-md:flex-col max-md:gap-2">
            <div className="text-nowrap w-fit">
              <h1 className="text-2xl max-md:text-lg font-bold">
                Transaksi (Grosir)
              </h1>
              <p className="text-sm max-md:text-xs text-slate-700">
                Pilih barang, atur jumlah, lalu lanjutkan ke pembayaran.
              </p>
            </div>
          </div>

          <hr className="mx-4" />

          <div className="px-6 mb-12">
            <TableData
              itemsPerPage={10}
              data={barang.map((item) => {
                const { quantity, ...itemWithoutQuantity } = item;
                return itemWithoutQuantity;
              })}
              showSearchSet={true}
              showAksi={true}
              showTambahBtn={true}
              onAdd={handleAddItem}
              selectedQuantities={Object.fromEntries(addedItems.map((item) => [item.id, item.quantity]))}
              showAddBtn={true}
              kategoriFilter={true}
              statusFilter={true}
              sortedData={true}
            />
          </div>

          {showCheckout && (
            <TransactionCart
              items={addedItems}
              totalItems={calculateTotalItems()}
              totalPrice={calculateTotalPrice()}
              priceKey="price_grosir"
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onCheckout={handleCheckout}
              onReset={handleReset}
            />
          )}
        </div>
      </ContentLayout>
    </div>
  );
};
