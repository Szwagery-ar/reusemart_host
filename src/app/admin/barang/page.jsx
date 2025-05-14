'use client';

import { useEffect, useState } from 'react';
import WithRole from '@/components/WithRole/WithRole';
import { EllipsisVertical } from "lucide-react";

export default function AdminBarangPage() {
    const [barangList, setBarangList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const res = await fetch('/api/barang');
                const data = await res.json();
                if (res.ok) {
                    setBarangList(data.barang);
                } else {
                    setError(data.error || 'Gagal mengambil data barang');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchBarang();
    }, []);

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

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <WithRole allowed={["Gudang", "Superuser"]}>
                <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Barang</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barangList.map((barang) => (
                        <div key={barang.id_barang} className="border p-4 rounded-lg shadow-sm bg-white">
                            {barang.gambar_barang && barang.gambar_barang[0] ? (
                                <img
                                    src={barang.gambar_barang[0].src_img}
                                    alt={barang.nama_barang}
                                    className="w-full h-48 object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                    Tidak ada gambar
                                </div>
                            )}
                            <h2 className="text-lg font-semibold mt-2">{barang.nama_barang}</h2>
                            <p className="text-sm text-gray-600">Kode: {barang.kode_produk}</p>
                            <p className="text-sm text-gray-600">Harga: Rp{parseInt(barang.harga_barang).toLocaleString('id-ID')}</p>
                            <p className="text-sm text-gray-600">Status Titip: {barang.status_titip}</p>
                            <p className="text-sm text-gray-600">Garansi: {barang.tanggal_garansi}</p>
                            <p className="text-sm text-gray-600">Tanggal Masuk: {barang.tanggal_masuk?.split('T')[0]}</p>
                            <p className="text-sm text-gray-600">Tanggal Keluar: {barang.tanggal_keluar?.split('T')[0] || '-'}</p>
                            <p className="text-sm text-gray-600">Penitip: {barang.penitip_name || '-'}</p>
                        </div>
                    ))}
                </div>
            </WithRole>
        </div>
    );
}
