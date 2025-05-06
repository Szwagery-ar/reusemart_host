'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Riwayat() {
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fungsi untuk format angka ke format Rupiah Indonesia
    const formatRupiah = (angka) => {
        const angkaTerformat = Number(angka);

        if (isNaN(angkaTerformat)) {
            return 'Rp 0';
        }

        return angkaTerformat
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Format dengan titik setiap 3 angka
    };

    useEffect(() => {
        const fetchRiwayat = async () => {
            try {
                const res = await fetch('/api/transaksi/history');
                if (res.ok) {
                    const data = await res.json();
                    setTransaksi(data.transaksi);
                } else {
                    setError('Gagal mengambil riwayat transaksi');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchRiwayat();
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
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6 rounded-4xl">
            <h1 className="text-2xl font-bold mb-4">Riwayat Pembelian</h1>

            {transaksi.length === 0 ? (
                <p className="text-gray-600">Belum ada riwayat pembelian.</p>
            ) : (
                <div className="w-full bg-white p-4 shadow-md rounded-xl">
                    {/* Container untuk transaksi yang bisa discroll */}
                    <div className="overflow-y-auto max-h-[70vh]"> {/* Adjust max-height to control scrolling */}
                        {transaksi.map((item) => (
                            <div key={item.id_transaksi} className="mb-6 border-b pb-4">
                                {/* Card untuk setiap transaksi */}
                                <div className="p-4 bg-white rounded-xl shadow-md">
                                    <div className="text-lg font-semibold">No Nota: {item.no_nota}</div>
                                    <div className="text-sm text-gray-600">Tanggal Pesan: {item.tanggal_pesan}</div>
                                    <div className="text-sm text-gray-600">Nama Pembeli: {item.nama}</div>
                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Harga Awal</span>
                                            <span>{formatRupiah(item.harga_awal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Ongkos Kirim</span>
                                            <span>{formatRupiah(item.ongkos_kirim)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Diskon</span>
                                            <span>{formatRupiah(item.diskon)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold mt-2 border-t pt-2">
                                            <span>Total Harga Akhir</span>
                                            <span>{formatRupiah(item.harga_akhir)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Status Transaksi</span>
                                            <span>{item.status_transaksi}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Status Pembayaran</span>
                                            <span>{item.status_pembayaran}</span>
                                        </div>
                                        {item.petugas_name && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Petugas CS</span>
                                                <span>{item.petugas_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Barang yang dibeli (ditampilkan dalam 1 card per transaksi) */}
                                    <div className="mt-4">
                                        <h3 className="font-semibold">Barang yang Dibeli:</h3>
                                        <div>
                                            {item.barang && item.barang.length > 0 ? (
                                                item.barang.map((barang, index) => (
                                                    <div key={`${item.id_transaksi}-${barang.kode_produk}-${index}`} className="border-b pb-2">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Kode Produk</span>
                                                            <span>{barang.kode_produk}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Nama Barang</span>
                                                            <span>{barang.nama_barang}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Harga Barang</span>
                                                            <span>{formatRupiah(barang.harga_barang)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Berat Barang</span>
                                                            <span>{barang.berat_barang} kg</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Status Garansi</span>
                                                            <span>{barang.status_garansi}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600">Tidak ada barang yang dibeli.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
