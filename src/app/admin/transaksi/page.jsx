"use client";

import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";

export default function AdminTransaksiPage() {
    const [transaksiList, setTransaksiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [jenisPengiriman, setJenisPengiriman] = useState("ALL");
    const [selectedTransaksi, setSelectedTransaksi] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [barangList, setBarangList] = useState([]);

    useEffect(() => {
        if (showDetailModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showDetailModal]);

    useEffect(() => {
        const fetchTransaksi = async () => {
            try {
                let url = "/api/transaksi/manajemen-transaksi";
                const params = [];

                if (jenisPengiriman !== "ALL") {
                    params.push(`jenis_pengiriman=${jenisPengiriman}`);
                }

                if (params.length > 0) {
                    url += `?${params.join("&")}`;
                }

                const res = await fetch(url);
                const data = await res.json();

                if (res.ok) {
                    setTransaksiList(data.transaksi);
                }
            } catch (err) {
                console.error("Gagal fetch transaksi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransaksi();
    }, [jenisPengiriman]);

    const filteredTransaksi = transaksiList.filter((t) => {
        if (statusFilter === "ALL") return true;
        return t.status_transaksi === statusFilter;
    });

    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING": return "Menunggu Pembayaran";
            case "PAID": return "Sudah Dibayar";
            case "ON_PROGRESS": return "Sedang Dikirim";
            case "DONE": return "Selesai";
            case "CANCELLED": return "Dibatalkan";
            default: return status;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-800";
            case "PAID": return "bg-blue-100 text-blue-800";
            case "ON_PROGRESS": return "bg-indigo-100 text-indigo-800";
            case "DONE": return "bg-green-100 text-green-800";
            case "CANCELLED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
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

    const statusOptions = [
        { label: "Semua", value: "ALL" },
        { label: "Menunggu Pembayaran", value: "PENDING" },
        { label: "Sudah Dibayar", value: "PAID" },
        { label: "Sedang Dikirim", value: "ON_PROGRESS" },
        { label: "Selesai", value: "DONE" },
        { label: "Dibatalkan", value: "CANCELLED" },
    ];

    const handleDetailClick = async (transaksi) => {
        setSelectedTransaksi(transaksi);
        setBarangList([]);
        setShowDetailModal(true);

        try {
            const res = await fetch(`/api/transaksi/manajemen-transaksi/barang-transaksi?id_transaksi=${transaksi.id_transaksi}`);
            const data = await res.json();
            if (res.ok) {
                setBarangList(data.barang);
            } else {
                console.error("Gagal mengambil data barang", data);
            }
        } catch (err) {
            console.error("Gagal fetch barang:", err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manajemen Transaksi</h1>

            <div className="flex gap-4 mb-4">
                <Tabs defaultValue="ALL" className="">
                    <TabsList className="flex gap-4">
                        {statusOptions.map(({ label, value }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                onClick={() => setStatusFilter(value)}
                            >
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div>
                    <select
                        value={jenisPengiriman}
                        onChange={(e) => setJenisPengiriman(e.target.value)}
                        className="px-4 py-1 rounded border"
                    >
                        <option value="ALL">Semua Pengiriman</option>
                        <option value="SELF_PICKUP">Self Pickup</option>
                        <option value="COURIER">Courier</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filteredTransaksi.length === 0 ? (
                <p>Tidak ada transaksi untuk kategori ini.</p>
            ) : (
                <div>
                    <div className="grid grid-cols-[80px_1fr_200px_140px_140px_140px_100px_80px] text-white p-4 rounded-xl font-semibold text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                        <div>Nota</div>
                        <div>Nama</div>
                        <div>Tanggal Pesan</div>
                        <div>Tanggal Lunas</div>
                        <div>Harga</div>
                        <div>Status</div>
                        <div className="flex justify-center">Action</div>
                    </div>

                    {filteredTransaksi.map((item) => (
                        <div key={item.id_transaksi} className="grid grid-cols-[80px_1fr_200px_140px_140px_140px_100px_80px] px-4 py-2 mt-3 rounded-xl border border-black text-sm">
                            <div className="truncate flex items-center">{item.no_nota}</div>
                            <div className="truncate flex items-center">{item.nama}</div>
                            <div className="flex items-center">{formatDate(item.tanggal_pesan)}</div>
                            <div className="flex items-center">{item.tanggal_lunas ? formatDate(item.tanggal_lunas) : "-"}</div>
                            <div className="flex items-center">{formatRupiah(item.harga_akhir)}</div>
                            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status_transaksi)}`}>
                                {getStatusLabel(item.status_transaksi)}
                            </div>
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={() => handleDetailClick(item)}
                                    className="text-gray-400 hover:text-indigo-600"
                                >
                                    <Settings />
                                </button>
                            </div>
                        </div>
                    ))}

                    {showDetailModal && selectedTransaksi && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-50">
                            <div className="bg-white w-full h-full max-w-2xl overflow-auto">
                                <div className="sticky top-0 left-0 right-0 z-20 px-6 py-4 flex justify-between items-center bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                                    <h2 className="text-xl font-bold text-white">Detail Transaksi</h2>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-white hover:text-red-500 transition-colors"
                                    >
                                        <X />
                                    </button>
                                </div>
                                <div className="p-6">

                                    <div className="space-y-2 text-sm">
                                        <p><strong>No Nota:</strong> {selectedTransaksi.no_nota}</p>
                                        <p><strong>Nama Pembeli:</strong> {selectedTransaksi.nama}</p>
                                        <p><strong>Jenis Pengiriman:</strong> {selectedTransaksi.jenis_pengiriman || '-'}</p>
                                        <p><strong>Tanggal Pesan:</strong> {formatDate(selectedTransaksi.tanggal_pesan)}</p>
                                        <p><strong>Tanggal Lunas:</strong> {selectedTransaksi.tanggal_lunas ? formatDate(selectedTransaksi.tanggal_lunas) : '-'}</p>
                                        <p><strong>Harga Awal:</strong> {formatRupiah(selectedTransaksi.harga_awal)}</p>
                                        <p><strong>Ongkos Kirim:</strong> {formatRupiah(selectedTransaksi.ongkos_kirim)}</p>
                                        <p><strong>Diskon:</strong> {formatRupiah(selectedTransaksi.diskon)}</p>
                                        <p><strong>Harga Akhir:</strong> {formatRupiah(selectedTransaksi.harga_akhir)}</p>
                                        <p><strong>Status:</strong> {getStatusLabel(selectedTransaksi.status_transaksi)}</p>

                                        <div className="mt-4">
                                            <h3 className="font-semibold mb-2">Barang dalam Transaksi</h3>
                                            {barangList.length === 0 ? (
                                                <p className="text-gray-500">Tidak ada barang</p>
                                            ) : (
                                                <ul className="space-y-4">
                                                    {barangList.map((barang, idx) => {
                                                        const imagesToShow = barang.images.slice(0, 3);
                                                        const extraCount = barang.images.length - 3;

                                                        return (
                                                            <li key={idx} className="border p-4 rounded">
                                                                <div className="flex space-x-2 mb-2">
                                                                    {imagesToShow.map((src, index) => (
                                                                        <img
                                                                            key={index}
                                                                            src={src}
                                                                            alt={`img-${index}`}
                                                                            className="w-16 h-16 object-cover rounded"
                                                                        />
                                                                    ))}
                                                                    {extraCount > 0 && (
                                                                        <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded text-sm font-semibold">
                                                                            +{extraCount}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm">
                                                                    <p>{barang.kode_produk}</p>
                                                                    <p className="font-medium">{barang.nama_barang}</p>
                                                                    <p>{formatRupiah(barang.harga_barang)}</p>
                                                                    <p>{barang.tanggal_garansi ? formatDate(barang.tanggal_garansi) : ''}</p>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
