"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, EllipsisVertical } from "lucide-react";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

export default function PenitipBarangPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [barangList, setBarangList] = useState([]);
    const [barangLoading, setBarangLoading] = useState(false);

    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                        fetchBarangPenitip();
                    } else {
                        setUser(null);
                        setError(userData.message || 'User not authenticated');
                        router.push('/login');
                    }
                } else {
                    setUser(null);
                    setError(userData.message || 'User not authenticated');
                    if (res.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Terjadi kesalahan');
            } finally {
                setUserLoading(false);
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
        return name ? name.charAt(0).toUpperCase() : '';
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
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
            .format(date)
            .replace('.', '');
    }

    function countTanggalExpire(tanggalString) {
        const tanggal = new Date(tanggalString);
        tanggal.setDate(tanggal.getDate() + 30);
        return tanggal;
    }


    return (
        <div className="p-6 relative">
            {/* Main Content */
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-4xl font-[Montage-Demo]">Barang Titipan</h2>
                    <div
                        className="p-1 rounded-full cursor-pointer flex items-center justify-center w-12 h-12"
                        onClick={() => router.push('/penitip/profile')}
                        style={{
                            background: 'radial-gradient(ellipse 130.87% 392.78% at 121.67% 0%, #26C2FF 0%, #220593 90%)',
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
                </div>}

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
            <div className="grid grid-cols-[60px_1fr_140px_140px_140px_140px_100px_80px] text-white p-4 rounded-xl font-semibold text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                <div>Kode</div>
                <div>Nama</div>
                <div>Harga</div>
                <div>Tanggal Masuk</div>
                <div>Tanggal Expire</div>
                <div>Tanggal Terbeli</div>
                <div>Status</div>
                <div className="flex justify-center">Action</div>
            </div>


            {/* Items */}
            {barangList.length === 0 ? (
                <div className="flex flex-row justify-center p-4 mt-3 rounded-xl border-1 border-black text-sm">
                    <p>Kamu belum menitipkan barang. Yuk titipin barangmu sekarang!</p>
                </div>
            ) : (
                <div>
                    {barangList.map((item) => (
                        <div key={item.id_barang} className="grid grid-cols-[60px_1fr_140px_140px_140px_140px_100px_80px] p-4 mt-3 rounded-xl border border-black text-sm">
                            <div>{item.kode_produk}</div>
                            <div className="truncate">{item.nama_barang}</div>
                            <div className="truncate">{formatRupiah(item.harga_barang)}</div>
                            <div>{formatDate(item.tanggal_masuk)}</div>
                            <div>{formatDate(countTanggalExpire(item.tanggal_masuk))}</div>
                            <div>{item.tanggal_keluar ? formatDate(item.tanggal_keluar) : "-"}</div>
                            <div>{item.status_titip}</div>
                            <div className="flex justify-center items-center">
                                <div className="relative dropdown-action">
                                    <button
                                        onClick={() =>
                                            setActiveDropdown(activeDropdown === item.id_barang ? null : item.id_barang)
                                        }
                                        className="text-gray-400 hover:text-indigo-600"
                                    >
                                        <EllipsisVertical />
                                    </button>

                                    {/* Dropdown yang hanya muncul jika ID-nya cocok */}
                                    {activeDropdown === item.id_barang && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                                            <button
                                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                onClick={() => handleEdit(item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                                onClick={() => handleDelete(item.id_barang)}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
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
