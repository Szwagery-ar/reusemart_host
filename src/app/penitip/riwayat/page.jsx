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
  const [userLoading, setUserLoading] = useState(true);
  const [transaksiList, setTransaksiList] = useState([]);
  const [transaksiLoading, setTransaksiLoading] = useState(false);

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

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
            setError(userData.message || "User not authenticated");
            router.push("/login");
          }
        } else {
          setUser(null);
          setError(userData.message || "User not authenticated");
          if (res.status === 401) {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Terjadi kesalahan");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // TRANSAKSI
  const fetchTransaksiPenitip = async () => {
    try {
      setTransaksiLoading(true);

      const res = await fetch("/api/transaksi/by-penitip", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          "Gagal mengambil transaksi:",
          errorData.error || res.status
        );
        return;
      }

      const data = await res.json();
      console.log("Transaksi data:", data); // Debug
      setTransaksiList(data.transaksi);
    } catch (err) {
      setError("Gagal mengambil transaksi penitip");
      console.error("Error fetching transaksi penitip:", err);
    } finally {
      setTransaksiLoading(false);
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

  function countTanggalExpire(tanggalString) {
    const tanggal = new Date(tanggalString);
    tanggal.setDate(tanggal.getDate() + 30);
    return tanggal;
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
        <Input
          placeholder="Cari kode transaksi, nama barang, atau pembeli"
          className="w-1/3"
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
            {transaksiList.map((item, index) => (
              <tr key={item.transaksi} className="rounded-xl border border-black text-sm hover:bg-gray-50">
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.no_nota}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.nama_barang}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.tanggal_pesan}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.nama_pembeli}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{formatRupiah(item.total_harga)}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{formatRupiah(item.komisi_penitip)}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.status_transaksi}</td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                  <EllipsisVertical />
                </td>
              </tr>
            ))}
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
    </div>
  );
}
