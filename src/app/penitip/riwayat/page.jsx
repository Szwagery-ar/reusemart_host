"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EllipsisVertical } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PenitipRiwayatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transaksiList, setTransaksiList] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            fetchTransaksiPenitip();
          } else {
            setUser(null);
            router.push("/login");
          }
        } else {
          setUser(null);
          if (res.status === 401) {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchTransaksiPenitip();
    }
  }, [searchQuery]);

  const fetchTransaksiPenitip = async () => {
    try {
      const res = await fetch(
        `/api/transaksi/by-penitip?q=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          "Gagal mengambil transaksi:",
          errorData.error || res.status
        );
        return;
      }

      const data = await res.json();
      console.log("Transaksi data:", data);
      setTransaksiList(data.transaksi);
    } catch (err) {
      console.error("Error fetching transaksi penitip:", err);
    }
  };

  // DROPDOWN
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".dropdown-action")) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleView = (item) => {
    setViewData(item);
    setShowSidebar(true);
  };

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(".", "");
  }

  return (
    <div className="p-6">
      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-[Montage-Demo]">Riwayat Transaksi</h2>
        <div
          className="p-1 rounded-full cursor-pointer flex items-center justify-center w-12 h-12"
          onClick={() => router.push("/penitip/profile")}
          style={{
            background:
              "radial-gradient(ellipse 130.87% 392.78% at 121.67% 0%, #26C2FF 0%, #220593 90%)",
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            {user && user.src_img_profile ? (
              <img
                src={user.src_img_profile}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : user ? (
              <span className="text-white text-lg font-semibold">
                {getFirstLetter(user.nama)}
              </span>
            ) : (
              <div className="animate-pulse w-full h-full bg-gray-300 rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="semua" className="mb-4">
        <TabsList className="flex gap-4">
          {[
            "Semua",
            "Menunggu Pembayaran",
            "Berjalan",
            "Selesai",
            "Dibatalkan",
          ].map((tab) => (
            <TabsTrigger key={tab} value={tab.toLowerCase().replace(/ /g, "-")}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Cari nomor nota, nama barang, atau nama pembeli"
          className="text-base px-4 py-2 border border-gray-300 rounded-md w-full max-w-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <label htmlFor="tanggal-pemesanan" className="text-sm  ml-5 block">
          Tanggal Pemesanan
        </label>
        <Input id="tanggal-pemesanan" type="date" className="w-1/4" />
      </div>

      <div className="overflow-x-auto flex flex-col">
        {/* Table Header */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="">
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">No.</th>
              <th className="px-5 py-3 text-white text-left">Nomor Nota</th>
              <th className="px-5 py-3 text-white text-left">Barang</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Pesan</th>
              <th className="px-5 py-3 text-white text-left">Nama Pembeli</th>
              <th className="px-5 py-3 text-white text-left">Total Harga</th>
              <th className="px-5 py-3 text-white text-left">Komisi</th>
              <th className="px-5 py-3 text-white text-left">Status</th>
              <th className="px-5 py-3 text-white text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {/* Items */}
            {transaksiList.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="w-full flex flex-row justify-center p-4 mt-3 rounded-xl border-1 border-black text-sm">
                    <p>Belum ada riwayat transaksi</p>
                  </div>
                </td>
              </tr>
            ) : (
              transaksiList.map((item, index) => (
                <tr
                  key={item.id_transaksi}
                  className="rounded-xl border border-black text-sm hover:bg-gray-50"
                >
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.no_nota}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.barang.map((b, i) => (
                      <div key={i}>{b.nama_barang}</div>
                    ))}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(item.tanggal_pesan)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.nama_pembeli}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatRupiah(item.total_harga)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatRupiah(item.komisi_penitip)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.status_transaksi}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    <div className="relative dropdown-action flex justify-center items-center">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.id_transaksi
                              ? null
                              : item.id_transaksi
                          )
                        }
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <EllipsisVertical />
                      </button>

                      {activeDropdown === item.id_transaksi && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleView(item)}
                          >
                            Lihat Detail
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-2 mb-4 flex justify-center items-center gap-2">
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="ghost" size="sm">
            ▶
          </Button>
        </div>
      </div>

      {showSidebar && viewData && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black opacity-20"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 bg-white w-2/5 h-full shadow-xl transition-transform duration-300">
            <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <h2 className="text-lg font-semibold">Detail Transaksi</h2>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div className="flex">
                <div className="w-2/5">No. Nota</div>
                <div className="flex-1 font-semibold">{viewData.no_nota}</div>
              </div>
              <div className="flex">
                <div className="w-2/5">Status Transaksi</div>
                <div className="flex-1 font-semibold">
                  {viewData.status_transaksi}
                </div>
              </div>
              <div className="flex">
                <div className="w-2/5">Tanggal Pembelian</div>
                <div className="flex-1 font-semibold">
                  {viewData.tanggal_pesan}
                </div>
              </div>
              <div className="flex">
                <div className="w-2/5">Nama Pembeli</div>
                <div className="flex-1 font-semibold">
                  {viewData.nama_pembeli}
                </div>
              </div>
              <hr />
              <div className="flex flex-col gap-2">
                <div className="font-semibold">Barang Terjual:</div>
                <div>
                  {viewData.barang.map((b, i) => (
                    <div key={i} className="flex">
                      <div className="mb-3 w-2/5">{b.nama_barang}</div>
                      <div className="flex-1">
                        {formatRupiah(b.harga_barang)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <div className="w-2/5">Total Harga</div>
                  <div className="flex-1 font-semibold">
                    {formatRupiah(viewData.total_harga)}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-2/5">Komisi Didapat</div>
                  <div className="flex-1 font-semibold">
                    {formatRupiah(viewData.komisi_penitip)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
