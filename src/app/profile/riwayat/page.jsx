'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ReuseButton from '@/components/ReuseButton/ReuseButton';
import ReduseButton from '@/components/ReduseButton/ReduseButton';

export default function Riwayat() {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [barangData, setBarangData] = useState({});

    const formatRupiah = (angka) => {
        const angkaTerformat = Number(angka);

        if (isNaN(angkaTerformat)) {
            return 'Rp 0';
        }

        return angkaTerformat
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatTanggal = (tanggalString) => {
        const tanggal = new Date(tanggalString);

        const namaBulan = [
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
            "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
        ];

        const hari = tanggal.getDate().toString().padStart(2, '0');
        const bulan = namaBulan[tanggal.getMonth()];
        const tahun = tanggal.getFullYear();

        const jam = tanggal.getHours().toString().padStart(2, '0');
        const menit = tanggal.getMinutes().toString().padStart(2, '0');

        return `${hari} ${bulan} ${tahun}, ${jam}:${menit}`;
    };


    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/transaksi/history');
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.transaksi);

                    for (let item of data.transaksi) {
                        await fetchBarang(item.id_transaksi);
                    }
                } else {
                    setError('Gagal mengambil riwayat transaksi');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const fetchBarang = async (id_transaksi) => {
        try {
            const res = await fetch(`/api/transaksi/history/barang?id_transaksi=${id_transaksi}`);
            if (res.ok) {
                const data = await res.json();

                setBarangData(prevData => ({
                    ...prevData,
                    [id_transaksi]: data.barang
                }));
            } else {
                console.error('Gagal mengambil data barang');
            }
        } catch (err) {
            console.error('Terjadi kesalahan saat mengambil barang:', err);
        }
    };

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await fetch('/api/transaksi/pending');
                if (res.ok) {
                    const data = await res.json();
                    setPending(data.transaksi);

                    for (let item of data.transaksi) {
                        await fetchBarang(item.id_transaksi);
                    }
                } else {
                    setError('Gagal mengambil data pending');
                }
            } catch (err) {
                console.error('Terjadi kesalahan saat mengambil data pending:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchPending();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 rounded-4xl">
                <h1 className="text-2xl font-bold mb-4">Riwayat Pembelian</h1>
                <p className="text-gray-600">Memuat data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 rounded-4xl">
                <h1 className="text-2xl font-bold mb-4">Riwayat Pembelian</h1>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="">
            {
                pending.length === 0 ? (
                    <h1 className="text-2xl font-bold">Menunggu Pembayaran</h1>

                ) : (
                    <div className="bg-white p-6 rounded-3xl border border-[#220593]">
                        <h1 className="text-2xl font-bold mb-4">Menunggu Pembayaran</h1>


                        {pending.map((item) => (
                            <div
                                key={item.id_transaksi}
                                className="rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 text-sm"
                            >
                                <div className="flex justify-between mb-3 p-2">
                                    <div>
                                        <p>No. Nota: {item.no_nota}</p>
                                        <p>Dipesan pada tanggal: {formatTanggal(item.tanggal_pesan)}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="font-semibold ">Total Bayar: Rp {formatRupiah(item.harga_akhir)}</div>
                                        <ReuseButton>
                                            <div className="px-4 py-2">
                                                Lihat Detail Transaksi
                                            </div>
                                        </ReuseButton>
                                        <ReduseButton>
                                            <div className="px-4 py-2">
                                                Batalkan Pesanan
                                            </div>
                                        </ReduseButton>
                                    </div>
                                </div>


                                <div className="flex justify-between p-4">
                                    <div className='flex items-center gap-4'>
                                        <div className="w-17 h-17 bg-gray-100 rounded-xl" />
                                        <div className="">
                                            <p className="font-semibold">Nama Item 1</p>
                                            <p className="text-gray-600">Rp250.000</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <p className="text-sm text-gray-500 text-right">+ {item.jumlah_barang - 1} barang lainnya</p>
                                        <ReuseButton>
                                            <div className="px-4 py-2">Lihat Detail Transaksi</div>
                                        </ReuseButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    // <div className="border-1 border-[#220593] bg-white p-4 rounded-4xl">
                    //     <h1 className="text-2xl font-bold">Menunggu Pembayaran</h1>
                    //     {pending.map((item) => (
                    //         <div key={item.id_transaksi} className="rounded-4xl shadow-sm mb-4 p-4 text-sm">
                    //             <div className="flex justify-between">
                    //                 <div className="">
                    //                     <div className="">No. Nota {item.no_nota}</div>
                    //                     <div>Dipesan pada tanggal: {item.tanggal_pesan}</div>
                    //                 </div>
                    //                 <div className="flex items-center gap-4">
                    //                     <div className="font-semibold ">Total Bayar: Rp {formatRupiah(item.harga_akhir)}</div>
                    //                     <ReuseButton>
                    //                         <div className="px-4 py-2">
                    //                             Lihat Detail Transaksi
                    //                         </div>
                    //                     </ReuseButton>
                    //                     <ReduseButton>
                    //                         <div className="px-4 py-2">
                    //                             Batalkan Pesanan
                    //                         </div>
                    //                     </ReduseButton>
                    //                 </div>
                    //             </div>

                    //         </div>
                    //     ))}

                    // </div>

                )
            }

            <div className="border-1 border-[#220593] bg-white p-4 rounded-4xl mt-4">
                <h1 className="text-2xl font-bold mb-4">Daftar Transaksi</h1>

                {
                    history.length === 0 ? (
                        <p className="text-gray-600">Belum ada riwayat pembelian.</p>
                    ) : (

                        <div className="w-full bg-white p-4 shadow-md rounded-xl">
                            <div className="overflow-y-auto max-h-[70vh]">
                                {history.map((item) => (
                                    <div key={item.id_transaksi} className="rounded-4xl shadow-sm mb-4 p-4 text-sm">
                                        <div className="">
                                            <span className="px-3 py-1 rounded-full bg-[#E6EEFF] text-sm font-semibold text-[#220593]">
                                                Dalam Pengiriman
                                            </span>
                                            <p className="font-semibold">
                                                Barang diambil kurir pada: 05 Mei 2025, 18.00
                                            </p>
                                        </div>
                                        <div className="flex justify-between mb-3">
                                            <div>
                                                <p>No. Nota: {item.no_nota}</p>
                                                <p>Dipesan pada tanggal: {formatTanggal(item.tanggal_pesan)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg">
                                                    Total Bayar: Rp {formatRupiah(item.harga_akhir)}
                                                </p>
                                                <p className="text-sm text-gray-500">+ {item.jumlah_barang - 1} barang lainnya</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                                            <div>
                                                <p className="font-semibold">Nama Item 1</p>
                                                <p className="text-gray-600">Rp250.000</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <ReuseButton>
                                                <div className="px-4 py-2">Lihat Detail Transaksi</div>
                                            </ReuseButton>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>


                    )
                }

            </div>
        </div >
    );
}
