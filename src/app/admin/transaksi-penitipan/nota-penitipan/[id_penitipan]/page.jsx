'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { handlePrintNotaPenitipan } from "@/utils/printNotaPenitipan";


export default function NotaPenitipanPage() {
    const { id_penitipan } = useParams();
    const [nota, setNota] = useState(null);
    const notaRef = useRef(null);

    useEffect(() => {
        const fetchNota = async () => {
            try {
                const res = await fetch(`/api/transaksi-penitipan/nota/${id_penitipan}`);
                const data = await res.json();
                setNota(data);
            } catch (error) {
                console.error("Gagal fetch nota:", error);
            }
        };
        if (id_penitipan) fetchNota();
    }, [id_penitipan]);

    const formatDateTime = (tanggal) => {
        const date = new Date(tanggal);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const formatDate = (tanggal) => {
        const date = new Date(tanggal);
        return date.toLocaleDateString('id-ID');
    };

    const formatRupiah = (angka) => {
        return parseInt(angka).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    };


    if (!nota) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <div ref={notaRef}>
                <h2 className="text-lg font-bold mb-4">Nota Penitipan Barang</h2>
                <div className="border p-4 rounded">
                    <div className="text-center font-semibold mb-2">
                        <p>ReUse Mart</p>
                        <p>Jl. Green Eco Park No. 456 Yogyakarta</p>
                    </div>

                    <div className="mb-3">
                        <p>No Nota : {nota?.no_nota || '-'}</p>
                        <p>Tanggal penitipan : {nota?.tanggal_masuk ? formatDateTime(nota.tanggal_masuk) : '-'}</p>
                        <p>Masa penitipan sampai : {nota?.tanggal_expire ? formatDate(nota.tanggal_expire) : '-'}</p>
                    </div>

                    <div className="mb-3">
                        <p className="font-semibold">
                            Penitip : {nota?.penitip?.id || "-"} / {nota?.penitip?.nama || "-"}
                        </p>
                    </div>

                    {(nota.barang || []).map((b, i) => (
                        <div key={i} className="mb-1">
                            <div className="produk-barang">
                                <p>{b.nama_barang}</p>
                                <p>{formatRupiah(b.harga_barang)}</p>
                            </div>
                            {b.tanggal_garansi && (
                                <p>Garansi ON : {new Date(b.tanggal_garansi).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
                            )}
                            <p>Berat barang: {b.berat_barang} kg</p>
                        </div>
                    ))}


                    <div className="mt-4">
                        <p>Diterima dan QC oleh:</p>
                        <p className="mt-1">{nota?.qc?.id || "-"} - {nota?.qc?.nama || "-"}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-right no-print">
                <button
                    onClick={() => handlePrintNotaPenitipan(nota, formatRupiah, formatDate, formatDateTime)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Cetak / Simpan PDF
                </button>
            </div>
        </div>
    );
}
