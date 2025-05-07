"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, CogIcon } from "lucide-react";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

export default function BarangTitipan() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [barangLoading, setBarangLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me');

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                } else {
                    setError('Gagal mengambil data pengguna');
                    router.push('/login');
                }
            } else {
                setError('Gagal mengambil data pengguna');
                if (res.status === 401) {
                    router.push('/login');
                }
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    fetchUserData();
  }, [router]);


  // BARANG
  const fetchBarangPenitip = async () => {
    try {
      setBarangLoading(true);

      const res = await fetch("/api/barang/by-penitip", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Gagal mengambil barang:", errorData.error || res.status);
        return;
      }

      const data = await res.json();
      setBarangList(data.barang);
    } catch (err) {
      setError("Gagal mengambil barang penitip");
      console.error("Error fetching barang penitip:", err);
    } finally {
      setBarangLoading(false);
    }
  }
  // useEffect(() => {
  //   const fetchBarangPenitip = async () => {
  //     const id_penitip = localStorage.getItem("id_penitip"); 
  //     if (!id_penitip) {
  //       setError("ID penitip tidak ditemukan");
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const res = await fetch("/api/barang/by-penitip", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ id_penitip }),
  //       });

  //       const data = await res.json();
  //       if (res.ok) {
  //         setBarangList(data.barang);
  //       } else {
  //         setError(data.error || "Gagal mengambil barang penitip");
  //       }
  //     } catch (err) {
  //       setError("Terjadi kesalahan saat mengambil data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBarangPenitip();
  // }, []);

  return (
    <div className="p-6 relative">
      {/* Main Content */}
        <h2 className="text-2xl font-bold mb-4">Barang Titipan</h2>

        {/* Tabs */}
        <Tabs defaultValue="semua" className="mb-4">
          <TabsList className="flex gap-4">
            {[
              "Semua",
              "Sedang Dititipkan",
              "Masa Titip Habis",
              "Dalam Transaksi",
              "Terjual",
              "Didonasikan",
            ].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase().replace(/ /g, "-")}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center mb-6">
          <Input placeholder="Cari kode atau nama barang" className="w-1/3" />
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              Tanggal Masuk <CalendarIcon size={16} />
            </Button>
          </div>
          <Input type="date" className="w-1/4" />
        </div>

        {/* Table Header */}
        <div className="flex flex-row text-white justify-between p-4 rounded-xl font-semibold text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
          <div className="max-w-20 grow">Kode</div>
          <div className="w-30 grow">Nama</div>
          <div className="w-20 grow">Harga</div>
          <div className="grow">Tanggal Masuk</div>
          <div className="grow">Tanggal Keluar</div>
          <div className="grow">Tanggal Expire</div>
          <div className="grow">Status</div>
          <div className="max-w-20 grow">Action</div>
        </div>

        {/* Items */}
        {barangList.length === 0 ? (
          <div className="flex flex-row justify-center p-4 mt-3 rounded-xl border-1 border-black text-sm">
            <p>Kamu belum menitipkan barang. Yuk titipin barangmu sekarang!</p>
          </div>
        ) : (
          <div>
          {barangList.map((item) => (
            <div className="flex flex-row justify-between p-4 mt-3 rounded-xl border-1 border-black text-sm">
              <div className="max-w-20 grow">Kode</div>
              <div className="w-30 grow">Nama</div>
              <div className="w-20 grow">Harga</div>
              <div className="grow">Tanggal Masuk</div>
              <div className="grow">Tanggal Keluar</div>
              <div className="grow">Tanggal Expire</div>
              <div className="grow">Status</div>
              <div className="max-w-20 grow">Action</div>
            </div>
          ))}

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-2">
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              ▶
            </Button>
          </div>
          </div>
        )}

    </div>
  );
}
