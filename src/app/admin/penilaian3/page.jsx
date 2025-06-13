"use client";
import { useEffect, useState } from "react";

export default function KomisiHunterPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKomisiHunter = async () => {
            try {
                const res = await fetch("/api/komisi/hunter");
                const result = await res.json();
                setData(result.data || []);
            } catch (err) {
                console.error("Gagal mengambil data komisi hunter:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchKomisiHunter();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                Komisi Hunter - Bulan Ini
            </h2>
            {loading ? (
                <p className="text-gray-500">Memuat data...</p>
            ) : data.length === 0 ? (
                <p className="text-gray-500">Tidak ada data komisi bulan ini.</p>
            ) : (
                <div className="border rounded-lg overflow-hidden shadow">
                    <div className="grid grid-cols-6 bg-indigo-600 text-white text-sm font-semibold p-3">
                        <div>Tanggal Lunas</div>
                        <div>Nama Barang</div>
                        <div>Tanggal Titip</div>
                        <div>Nama Hunter</div>
                        <div>Status Barang</div>
                        <div>Komisi Hunter</div>
                    </div>
                    {data.map((item, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-6 border-b text-sm p-3 hover:bg-gray-50"
                        >
                            {new Date(item.tanggal_lunas).toLocaleDateString("id-ID")}
                            <div>{item.nama_barang}</div>
                            <div>{new Date(item.tanggal_titip).toLocaleDateString("id-ID")}</div>
                            <div>{item.nama_hunter}</div>
                            <div>{item.status_titip}</div>
                            <div>Rp {Math.round(item.komisi_hunter).toLocaleString("id-ID")}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
