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
    const [showAll, setShowAll] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => {
        if (currentPage < Math.ceil(history.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


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

    const deadlineBayar = (tanggalString) => {
        const tanggal = new Date(tanggalString);

        // Menambahkan 15 menit
        tanggal.setMinutes(tanggal.getMinutes() + 15);

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

    const openModal = (transaction) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
        document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedTransaction(null);
        document.body.style.overflow = "auto";
    };

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

    const handleLihatSemua = () => {
        setShowAll(!showAll);
    };

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
                                <div className="mb-3 p-2">
                                    <div className="text-[#E49502] mb-3 font-semibold">Selesaikan pembayaran sebelum: {deadlineBayar(item.tanggal_pesan)}</div>
                                    <div className="flex justify-between">
                                        <div>
                                            <p>No. Nota: {item.no_nota}</p>
                                            <p>Dipesan pada tanggal: {formatTanggal(item.tanggal_pesan)}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="font-semibold ">Total Bayar: Rp {formatRupiah(item.harga_akhir)}</div>
                                            <ReduseButton>
                                                <div className="px-4 py-2">
                                                    Batalkan Pesanan
                                                </div>
                                            </ReduseButton>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex justify-between p-4">
                                    {barangData[item.id_transaksi]?.slice(0, 1).map((item) => (
                                        <div key={`${item.id}_${item.nama_barang}`} className="flex items-center gap-4">
                                            <div className="w-17 h-17 bg-gray-100 rounded-xl">
                                                <img
                                                    src={item.src_img || "/path/to/default-image.jpg"}
                                                    alt={item.nama_barang}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{item.nama_barang}</p>
                                                <p className="text-gray-600">Rp{formatRupiah(item.harga_barang)}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex flex-col justify-between">
                                        {barangData[item.id_transaksi]?.length > 1 && (
                                            <p className="text-sm text-gray-500 text-right">
                                                + {barangData[item.id_transaksi]?.length - 1} barang lainnya
                                            </p>
                                        )}
                                        <ReuseButton>
                                            <div className="px-4 py-2" onClick={() => openModal(item)}>Lihat Detail Transaksi</div>
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

            <div className="border border-[#220593] mt-4 px-4 py-2 rounded-4xl text-xs">
                <h1 className="text-2xl font-bold mb-4">Daftar Transaksi</h1>

                {history.length === 0 ? (
                    <p className="text-gray-600">Belum ada riwayat pembelian.</p>
                ) : (
                    <div className="w-full bg-white p-4 rounded-xl">
                        <div className="">
                            {currentItems.map((item) => (
                                <div
                                    key={item.id_transaksi}
                                    className="rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 text-sm"
                                >
                                    <div className="mb-3 p-2">
                                        <div className="mb-6">
                                            <div className="flex gap-3 items-center">
                                                <div
                                                    className={`px-4 py-2 rounded-full text-xs font-semibold 
                                                        ${item.status_transaksi === "PENDING" ? "bg-[#FFF2D5] text-[#B87A06]" :
                                                            item.status_transaksi === "DONE" ? "bg-[#D6FFDE] text-[#0A6810]" :
                                                                item.status_transaksi === "PAID" ? "bg-[#D6FFDE] text-[#0A6810]" :
                                                                    item.status_transaksi === "ON_PROGRESS" ? item.jenis_pengiriman === "COURIER"
                                                                        ? "bg-[#DDEDFC] text-[#1C274C]"
                                                                        : item.jenis_pengiriman === "SELF_PICKUP"
                                                                            ? "bg-[#DDEDFC] text-[#1C274C]"
                                                                            : "bg-gray-200 text-gray-800"
                                                                        : item.status_transaksi === "CANCELLED"
                                                                            ? "bg-[#FFEAEF] text-[#F0144A]"
                                                                            : "bg-gray-100 text-gray-500"
                                                        }`}
                                                >
                                                    {item.status_transaksi === "PENDING"
                                                        ? "Menunggu Pembayaran"
                                                        : item.status_transaksi === "DONE"
                                                            ? "Selesai"
                                                            : item.status_transaksi === "PAID"
                                                                ? "Dalam Proses"
                                                                : item.status_transaksi === "ON_PROGRESS"
                                                                    ? item.jenis_pengiriman === "COURIER"
                                                                        ? "Dalam Pengiriman"
                                                                        : item.jenis_pengiriman === "SELF_PICKUP"
                                                                            ? "Dapat Diambil"
                                                                            : "Status Tidak Dikenal"
                                                                    : item.status_transaksi === "CANCELLED"
                                                                        ? "Dibatalkan"
                                                                        : "Status Tidak Dikenal"
                                                    }
                                                </div>

                                                {item.status_transaksi !== "PENDING" && (
                                                    <div className="font-semibold">
                                                        {
                                                            item.status_transaksi === "ON_PROGRESS" && item.jenis_pengiriman === "SELF_PICKUP"
                                                                ? `Barang dapat diambil hingga ${new Date(new Date(item.tanggal_pesan).setDate(new Date(item.tanggal_pesan).getDate() + 5)).toLocaleDateString()}`  // 5 hari setelah tanggal transaksi
                                                                : item.status_transaksi === "ON_PROGRESS" && item.jenis_pengiriman === "COURIER"
                                                                    ? `Barang diambil kurir pada ${formatTanggal(item.tanggal_kirim)}`
                                                                    : item.status_transaksi === "DONE"
                                                                        ? `Barang sudah tiba pada ${formatTanggal(item.tanggal_terima)}`
                                                                        : ""
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <p>No. Nota: {item.no_nota}</p>
                                                <p>Dipesan pada tanggal: {formatTanggal(item.tanggal_pesan)}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="font-semibold ">Total Bayar: Rp {formatRupiah(item.harga_akhir)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between p-4">
                                        {barangData[item.id_transaksi]?.slice(0, 1).map((item) => (
                                            <div key={`${item.id}_${item.nama_barang}`} className="flex items-center gap-4">
                                                <div className="w-17 h-17 bg-gray-100 rounded-xl">
                                                    <img
                                                        src={item.src_img || "/path/to/default-image.jpg"}
                                                        alt={item.nama_barang}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.nama_barang}</p>
                                                    <p className="text-gray-600">Rp{formatRupiah(item.harga_barang)}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex flex-col justify-between">
                                            {barangData[item.id_transaksi]?.length > 1 && (
                                                <p className="text-sm text-gray-500 text-right">
                                                    + {barangData[item.id_transaksi]?.length - 1} barang lainnya
                                                </p>
                                            )}
                                            <ReuseButton>
                                                <div className="px-4 py-2" onClick={() => openModal(item)}>Lihat Detail Transaksi</div>
                                            </ReuseButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className=" text-[#220593] rounded-md disabled:text-[#CDE7FF]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>

                            </button>
                            <div className="flex gap-2">
                                {Array.from({ length: Math.ceil(history.length / itemsPerPage) }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => paginate(index + 1)}
                                        className={`px-3 py-1 rounded-xs text-sm 
                                        ${currentPage === index + 1 ? "bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white" : "bg-white text-blue-500"}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === Math.ceil(history.length / itemsPerPage)}
                                className="text-[#220593] rounded-md disabled:text-[#CDE7FF]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>

                            </button>
                        </div>
                    </div>
                )}
            </div>
            {modalOpen && selectedTransaction && (
                <div className="fixed inset-0 p-60 bg-black/20 flex justify-center items-center z-99">
                    <div className="bg-white p-6 rounded-4xl w-full h-150">
                        {/* Modal Header */}
                        <div className="flex justify-between mb-4">
                            <h2 className="text-2xl font-semibold">Detail Transaksi</h2>
                            <button onClick={closeModal} className="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] w-full h-0.5" />

                        <div className="flex mb-3 mt-3 justify-between">
                            <div className="w-180 h-120 overflow-y-scroll hide-scrollbar">
                                {/* Status Transaksi */}
                                <div
                                    className={`px-4 py-2 rounded-full text-xs font-semibold w-fit
                                        ${selectedTransaction.status_transaksi === "PENDING" ? "bg-[#FFF2D5] text-[#B87A06]" :
                                            selectedTransaction.status_transaksi === "DONE" ? "bg-[#D6FFDE] text-[#0A6810]" :
                                                selectedTransaction.status_transaksi === "ON_PROGRESS" ? selectedTransaction.jenis_pengiriman === "COURIER"
                                                    ? "bg-[#DDEDFC] text-[#1C274C]"
                                                    : selectedTransaction.jenis_pengiriman === "SELF_PICKUP"
                                                        ? "bg-[#DDEDFC] text-[#1C274C]"
                                                        : "bg-gray-200 text-gray-800"
                                                    : selectedTransaction.status_transaksi === "CANCELLED"
                                                        ? "bg-[#FFEAEF] text-[#F0144A]"
                                                        : "bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    {selectedTransaction.status_transaksi === "PENDING"
                                        ? "Menunggu Pembayaran"
                                        : selectedTransaction.status_transaksi === "DONE"
                                            ? "Selesai"
                                            : selectedTransaction.status_transaksi === "ON_PROGRESS"
                                                ? selectedTransaction.jenis_pengiriman === "COURIER"
                                                    ? "Dalam Pengiriman"
                                                    : selectedTransaction.jenis_pengiriman === "SELF_PICKUP"
                                                        ? "Dapat Diambil"
                                                        : "Status Tidak Dikenal"
                                                : selectedTransaction.status_transaksi === "CANCELLED"
                                                    ? "Dibatalkan"
                                                    : "Status Tidak Dikenal"
                                    }
                                </div>

                                {/* Detail Transaksi */}
                                <div className="w-100">
                                    <div className="mb-3 grid grid-cols-2 gap-4">
                                        <div className="">No. Nota</div>
                                        <p>: {selectedTransaction.no_nota}</p>
                                    </div>
                                    <div className="mb-3 grid grid-cols-2 gap-4">
                                        <div className="">Tanggal Pesan </div>
                                        <p>: {formatTanggal(selectedTransaction.tanggal_pesan)}</p>
                                    </div>
                                </div>

                                <div className='border-b-2 my-4' />

                                {/* Detail Produk */}
                                <div className="">
                                    <div className="font-semibold mb-3 text-lg">Detail Produk:</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {barangData[selectedTransaction.id_transaksi].slice(0, showAll ? barangData[selectedTransaction.id_transaksi].length : 2).map((barang) => (
                                            <div key={`${barang.id}_${barang.nama_barang}`} className="flex gap-4 border-2 border-[#220593] p-3 justify-between rounded-2xl">
                                                <div className="flex gap-3">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-xl">
                                                        <img
                                                            src={barang.src_img || "/path/to/default-image.jpg"}
                                                            alt={barang.nama_barang}
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-2">
                                                        <div className="font-semibold text-sm w-35 truncate">{barang.nama_barang}</div>
                                                        <p className="text-xs">Rp{formatRupiah(barang.harga_barang)}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-9">
                                                    <ReuseButton>
                                                        <div className='text-xs py-1 px-2'>Lihat Detail</div>
                                                    </ReuseButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {barangData[selectedTransaction.id_transaksi].length > 2 && (
                                        <button
                                            onClick={handleLihatSemua}
                                            className="mt-4 hover:underline text-[#220593] font-medium"
                                        >
                                            {showAll ? "Tutup" : "Lihat Semua Barang"}
                                        </button>
                                    )}

                                </div>

                                <div className='border-b-2 my-4' />

                                {/* Informasi Pengiriman */}
                                <div className='w-100'>
                                    <div className="font-semibold mb-3 text-lg">Informasi Pengiriman</div>
                                    <div className="grid grid-cols-2">
                                        <div className="">
                                            <p>Opsi Pengiriman</p>
                                            <p>Alamat Pengiriman</p>
                                        </div>
                                        <div className="">
                                            <p><span className='pe-2'>:</span> {selectedTransaction.jenis_pengiriman}</p>
                                            <p><span className='pe-2'>:</span> {selectedTransaction.lokasi}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='border-b-2 my-4' />

                                {/* Detail Pembayaran */}
                                <div className='w-100'>
                                    <div className="font-semibold mb-3 text-lg">Detail Pembayaran</div>
                                    <div className="grid grid-cols-2">
                                        <div className="">
                                            <p>Total Sementara</p>
                                            <p>Ongkos Kirim</p>
                                            <p>Potongan Poin</p>
                                            <p className='font-semibold'>Total Pembayaran</p>
                                            <p className='font-semibold'>Poin dari Pesanan Ini</p>
                                        </div>
                                        <div className="">
                                            <p><span className='pe-2'>:</span> Rp {formatRupiah(selectedTransaction.harga_awal)}</p>
                                            <p><span className='pe-2'>:</span> Rp {formatRupiah(selectedTransaction.ongkos_kirim)}</p>
                                            <p><span className='pe-2'>:</span>-Rp {formatRupiah(selectedTransaction.diskon)}</p>
                                            <p className='font-semibold'><span className='pe-2'>:</span>-Rp {formatRupiah(selectedTransaction.harga_akhir)}</p>
                                            <p className='font-semibold'><span className='pe-2'>:</span>{selectedTransaction.tambahan_poin} Reusepoint</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="">
                                {/* Modal Footer */}
                                <div className="mt-4 flex flex-col gap-4">
                                    <ReuseButton><div className='py-2 px-3 text-xs font-semibold'>Lihat Bukti Pembayaran</div></ReuseButton>
                                    <ReuseButton><div className='py-2 px-3 text-xs font-semibold'>Bantuan</div></ReuseButton>
                                    <ReuseButton><div className='py-2 px-3 text-xs font-semibold'>Hubungi Customer Service</div></ReuseButton>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
