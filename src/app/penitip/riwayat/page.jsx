'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CalendarIcon, CogIcon } from "lucide-react";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const statuses = [
  "Aktif",
  "Dalam Pesanan",
  "Terjual",
  "Aktif - Extended",
  "Masa Tenggang Konfirmasi",
  "Dapat Diambil Kembali",
  "Siap Didonasikan",
  "Didonasikan",
];

export default function BarangTitipan() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-4">Barang Titipan</h2>

        {/* Tabs */}
        <Tabs defaultValue="semua" className="mb-4">
          <TabsList className="flex gap-4">
            {["Semua", "Sedang Dititipkan", "Masa Titip Habis", "Dalam Transaksi", "Terjual", "Didonasikan"].map((tab) => (
              <TabsTrigger key={tab} value={tab.toLowerCase().replace(/ /g, '-')}>{tab}</TabsTrigger>
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
          <div className="grow">Harga</div>
          <div className="grow">Tanggal Masuk</div>
          <div className="grow">Tanggal Keluar</div>
          <div className="grow">Tanggal Expire</div>
          <div className="grow">Status</div>
          <div className="grow">Action</div>
        </div>

          {/* <tbody className="bg-white divide-y divide-gray-100">
            {penitipList.map((p) => (
                <tr key={p.id_penitip} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.no_ktp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">+62{p.no_telepon}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.badge_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.total_barang}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setActiveDropdown(activeDropdown === p.id_penitip ? null : p.id_penitip)} className="text-gray-400 hover:text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                                </svg>
                            </button>
                            {activeDropdown === p.id_penitip && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                                    <button className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => handleEdit(p)}>Edit</button>
                                    <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={() => handleDelete(p.id_penitip)}>Hapus</button>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            ))}
          </tbody> */}

        {/* Items */}
        {statuses.map((status, idx) => (
          <Card key={idx} className="grid grid-cols-7 items-center gap-2">
            <CardContent className="p-2 col-span-7 grid grid-cols-7 items-center justify-left">
              <div>V101</div>
              <div className="truncate">Vinyl Record 'The Beatles - Abbey Road' Edisi Langka</div>
              <div>Rp 31.850.000</div>
              <div>08 Apr 2025</div>
              <div>08 Mei 2025</div>
              <div>08 Mei 2025</div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 whitespace-nowrap">{status}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <CogIcon size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <Button variant="outline" size="sm">1</Button>
          <Button variant="ghost" size="sm">▶</Button>
        </div>
      </main>
    </div>
  );
}
