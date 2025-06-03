"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import RippleButton from "@/components/RippleButton/RippleButton";
import ReuseButton from "@/components/ReuseButton/ReuseButton";
import ReduseButton from "@/components/ReduseButton/ReduseButton";

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usePoin, setUsePoin] = useState(true);

  const [poinDigunakan, setPoinDigunakan] = useState(0);
  const poinLoyalitas = user?.poin_loyalitas || 0;

  const totalHarga = cartItems
    .filter((item) => selectedItems.includes(item.id_bridge_barang))
    .reduce((sum, item) => {
      const harga = Number(item.harga_barang);
      return sum + (isNaN(harga) ? 0 : harga);
    }, 0);

  const potonganPoin = Math.min(poinDigunakan * 10000, totalHarga);
  const totalAkhir = totalHarga - potonganPoin;

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const resUser = await fetch("/api/auth/me");
        const dataUser = await resUser.json();
        if (!resUser.ok || !dataUser.success) {
          router.push("/login");
          return;
        }

        const user = dataUser.user;
        setUser(user);

        const userId = user.id_pembeli;

        const resCart = await fetch("/api/cart");
        const cartData = await resCart.json();

        const userCart = cartData.cart.find((c) => c.id_pembeli === userId);
        if (!userCart) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const resBridge = await fetch("/api/bridgebarangcart");
        const bridgeData = await resBridge.json();

        const bridgeItems = bridgeData.bridgeData.filter(
          (item) => item.id_cart === userCart.id_cart && item.is_checkout !== 1
        );

        const resBarang = await fetch("/api/barang");
        const barangData = await resBarang.json();

        const mergedItems = bridgeItems.map((item) => {
          const barang = barangData.barang.find(
            (b) => b.id_barang === item.id_barang
          );
          return {
            ...item,
            nama_barang: barang?.nama_barang,
            harga_barang: barang?.harga_barang,
            src_img:
              barang?.gambar_barang?.[0]?.src_img ||
              "/images/default-image.jpg",
          };
        });

        setCartItems(mergedItems);
        setSelectedItems(mergedItems.map((item) => item.id_bridge_barang));
        setLoading(false);
      } catch (err) {
        console.error("Gagal load keranjang:", err);
        setLoading(false);
      }
    };

    fetchCartData();
  }, [router]);

  const handleCheckout = async () => {
    try {
      const resMark = await fetch("/api/bridgebarangcart/mark-checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_bridge_barang: selectedItems }),
      });

      if (!resMark.ok) {
        const error = await resMark.json();
        alert(error.error);
        return;
      }

      const resTx = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pembeli: user.id_pembeli,
          selectedItems,
          diskon: potonganPoin,
          poin_digunakan: poinDigunakan,
        }),
      });

      const result = await resTx.json();
      if (!resTx.ok) {
        alert(result.error);
        return;
      }

      const idTransaksi = result.id_transaksi;
      router.push(`/cart/checkout?id_transaksi=${idTransaksi}`);
    } catch (err) {
      console.error("Checkout gagal:", err);
      alert("Terjadi kesalahan saat proses checkout.");
    }
  };

  const groupedItems = cartItems.reduce((groups, item) => {
    const key = item.nama_penitip || "Penitip Tidak Diketahui";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  const toggleSelectGroup = (penitip, items) => {
    const allSelected = items.every((item) =>
      selectedItems.includes(item.id_bridge_barang)
    );

    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !items.some((item) => item.id_bridge_barang === id))
      );
    } else {
      const newSelected = items
        .filter((item) => !selectedItems.includes(item.id_bridge_barang))
        .map((item) => item.id_bridge_barang);

      setSelectedItems((prev) => [...prev, ...newSelected]);
    }
  };

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const handleRemove = async (id_bridge_barang) => {
    const res = await fetch("/api/bridgebarangcart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_bridge_barang }),
    });

    if (res.ok) {
      setCartItems((prev) =>
        prev.filter((item) => item.id_bridge_barang !== id_bridge_barang)
      );
      setSelectedItems((prev) => prev.filter((id) => id !== id_bridge_barang));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id_bridge_barang));
    }
  };

  if (loading) return <div className="p-6">Loading keranjang...</div>;

  return (
    <div className="">
      <Navbar />
      <div className="px-20 my-25">
        <h1 className="text-3xl font-bold mb-6">Keranjang</h1>

        {cartItems.length === 0 ? (
          <div className="text-center mt-12">
            <img
              src="/images/empty-cart.png"
              alt="Kosong"
              className="mx-auto w-40 mb-4"
            />
            <p className="text-gray-600">Keranjang kamu masih kosong.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="shadow-sm px-4 py-3 rounded-xl flex justify-between items-center">
              <label className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedItems.length === cartItems.length}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-sm border-2 border-black flex items-center justify-center transition p-1
                                            ${
                                              selectedItems.length ===
                                              cartItems.length
                                                ? "bg-[radial-gradient(ellipse_130.87%_130.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-none"
                                                : "border-black bg-white"
                                            }`}
                    >
                      {selectedItems.length === cartItems.length && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          fill="white"
                          className="w-3 h-3"
                        >
                          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold">
                    Pilih Semua ({cartItems.length})
                  </span>
                </div>
              </label>
              <button className="text-red-500 font-semibold">Hapus</button>
            </div>

            {Object.entries(groupedItems).map(([penitip, items]) => (
              <div key={penitip} className="mb-6">
                <div className="shadow-sm p-4 rounded-xl mb-4">
                  <label className="flex items-center gap-2 text-lg font-bold mb-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        onChange={() => toggleSelectGroup(penitip, items)}
                        checked={items.every((item) =>
                          selectedItems.includes(item.id_bridge_barang)
                        )}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-sm border-2 border-black flex items-center justify-center transition p-1
                        ${
                            items.every((item) =>
                            selectedItems.includes(
                                item.id_bridge_barang
                            )
                            )
                            ? "bg-[radial-gradient(ellipse_130.87%_130.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-none"
                            : "border-black bg-white"
                        }`}
                      >
                        {items.every((item) =>
                          selectedItems.includes(item.id_bridge_barang)
                        ) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            fill="white"
                            className="w-3 h-3"
                          >
                            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold ml-2">{penitip}</span>
                  </label>

                  {items.map((item) => (
                    <div
                      key={item.id_bridge_barang}
                      className="p-4 rounded-xl flex flex-col gap-2"
                    >
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              onChange={() =>
                                toggleSelectItem(item.id_bridge_barang)
                              }
                              checked={selectedItems.includes(
                                item.id_bridge_barang
                              )}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-sm border-2 border-black flex items-center justify-center transition p-1
                                ${
                                    selectedItems.includes(
                                    item.id_bridge_barang
                                    )
                                    ? "bg-[radial-gradient(ellipse_130.87%_130.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-none"
                                    : "border-black bg-white"
                                }`}
                            >
                              {selectedItems.includes(
                                item.id_bridge_barang
                              ) && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                  fill="white"
                                  className="w-3 h-3"
                                >
                                  <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </label>
                        <img
                          src={item.src_img}
                          className="w-24 h-24 object-cover rounded"
                          alt={item.nama_barang}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.nama_barang}
                          </p>
                          <p className="font-bold text-xl mt-2">
                            {formatRupiah(item.harga_barang)}
                          </p>
                        </div>

                        <ReduseButton
                          onClick={() => handleRemove(item.id_bridge_barang)}
                        >
                          <div className="px-3 py-1 flex items-center">
                            Hapus
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="size-5 ml-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </div>
                        </ReduseButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white shadow-md rounded-xl p-4 mt-6">
              <h2 className="text-lg font-semibold mb-4">Rincian Biaya</h2>
              <p className="text-sm text-gray-700 mb-2">
                Kamu punya <strong>{user?.poin_loyalitas || 0}</strong> poin
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm">Gunakan</label>
                <input
                  type="text"
                  value={poinDigunakan}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const maxPoin = Math.min(
                      user?.poin_loyalitas || 0,
                      Math.floor(totalHarga / 100)
                    );
                    setPoinDigunakan(
                      isNaN(val) ? 0 : Math.max(0, Math.min(val, maxPoin))
                    );
                  }}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-sm">poin</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sisa poin: {(user?.poin_loyalitas || 0) - poinDigunakan}
              </p>

              <div className="flex justify-between mt-4">
                <span>Total Harga</span>
                <span>{formatRupiah(totalHarga)}</span>
              </div>

              {poinDigunakan > 0 && (
                <div className="flex justify-between">
                  <span>Potongan dari Poin ({poinDigunakan} poin)</span>
                  <span className="text-green-600">
                    - {formatRupiah(potonganPoin)}
                  </span>
                </div>
              )}

              <hr className="my-2" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total Bayar</span>
                <span>{formatRupiah(totalAkhir)}</span>
              </div>

              <RippleButton
                type="button"
                onClick={handleCheckout}
                className="w-full mt-4 text-white py-2 rounded-lg font-semibold bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0%,_#26C2FF_0%,_#220593_90%)]"
              >
                Checkout ({selectedItems.length})
              </RippleButton>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
