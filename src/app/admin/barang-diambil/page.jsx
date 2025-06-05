"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BarangPengambilanPage() {
    const [barangList, setBarangList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const res = await fetch("/api/barang/ready-pickup");
                const data = await res.json();

                if (res.ok) {
                    setBarangList(data.barang || []);
                } else {
                    console.error(data.error || "Gagal mengambil data");
                }
            } catch (err) {
                console.error("Error fetch:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBarang();
    }, []);

    const formatDate = (date) => {
        if (!date) return "-";
        return format(new Date(date), "dd MMMM yyyy", { locale: id });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Barang Siap Diambil Penitip</h1>

            {loading ? (
                <p>Memuat data...</p>
            ) : barangList.length === 0 ? (
                <p>Tidak ada barang yang siap diambil oleh penitip.</p>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">Kode</th>
                                <th className="px-4 py-2 text-left">Nama Barang</th>
                                <th className="px-4 py-2 text-left">Penitip</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Tanggal Konfirmasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barangList.map((barang) => (
                                <tr key={barang.id_barang} className="border-t">
                                    <td className="px-4 py-2">{barang.kode_produk}</td>
                                    <td className="px-4 py-2">{barang.nama_barang}</td>
                                    <td className="px-4 py-2">{barang.nama_penitip}</td>
                                    <td className="px-4 py-2 text-yellow-600 font-semibold">{barang.status_titip}</td>
                                    <td className="px-4 py-2">{formatDate(barang.tanggal_konfirmasi)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
