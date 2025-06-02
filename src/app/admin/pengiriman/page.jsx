"use client";

import { useEffect, useState } from "react";
import { Settings, Printer, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function AdminPengirimanPage() {
    const [transaksiList, setTransaksiList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaksi, setSelectedTransaksi] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedPickupDate, setSelectedPickupDate] = useState("");

    const [selectedKurir, setSelectedKurir] = useState("");
    const [kurirList, setKurirList] = useState([]);
    const [filterJenis, setFilterJenis] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [transaksiDetail, setTransaksiDetail] = useState(null);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showModal]);

    const handleCancelIfLate = async (id_transaksi) => {
        try {
            const res = await fetch(`/api/transaksi/${id_transaksi}/cancel-if-late`, {
                method: "PATCH",
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Gagal membatalkan transaksi.");
            } else {
                toast.success(data.message || "Transaksi dibatalkan & barang jadi donasi.");
                setShowModal(false);
                fetchPengiriman();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Terjadi kesalahan saat membatalkan transaksi.");
        }
    };


    const fetchPengiriman = async () => {
        try {
            const res = await fetch("/api/pengiriman/aturjadwal");
            const data = await res.json();
            setTransaksiList(Array.isArray(data.pengiriman) ? data.pengiriman : []);
        } catch (err) {
            console.error("Gagal fetch data pengiriman:", err);
        }
    };

    useEffect(() => {
        fetchPengiriman();
    }, []);


    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", minimumFractionDigits: 0
    }).format(value);

    const getStatusStyle = (status) => {
        switch (status) {
            case "IN_PROGRESS": return "bg-gray-100 text-gray-800";
            case "IN_DELIVERY": return "bg-yellow-100 text-yellow-800";
            case "PICKED_UP": return "bg-blue-100 text-blue-800";
            case "DONE": return "bg-green-100 text-green-800";
            case "FAILED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (item) => {
        if (item.status_pengiriman === "IN_PROGRESS") {
            if (item.status_pembayaran === "PENDING") return "Menunggu Bayar";
            if (item.status_pembayaran === "CONFIRMED" && item.jenis_pengiriman === "SELF_PICKUP") return "Atur Jadwal";
            if (item.status_pembayaran === "CONFIRMED" && item.jenis_pengiriman === "COURIER") return "Butuh Kurir";
            return "Sedang Diproses";
        }
        switch (item.status_pengiriman) {
            case "IN_DELIVERY": return "Dalam Pengiriman";
            case "PICKED_UP": return "Akan Diambil";
            case "DONE": return "Selesai";
            case "FAILED": return "Gagal";
            default: return item.status_pengiriman;
        }
    };


    const getPengirimanMin = (tanggalPesanStr) => {
        const pesanDate = new Date(tanggalPesanStr);
        const now = new Date();
        const offset = now.getTimezoneOffset();

        if (pesanDate.getHours() >= 16) {
            pesanDate.setDate(pesanDate.getDate() + 1);
        }

        pesanDate.setHours(0, 0, 0, 0);
        const iso = new Date(pesanDate.getTime() - offset * 60000).toISOString().slice(0, 16);
        return iso;
    };

    const handleDetailClick = async (transaksi) => {
        setSelectedTransaksi(transaksi);
        setSelectedDate("");
        setSelectedKurir("");

        try {
            const [kurirRes, detailRes] = await Promise.all([
                fetch(`/api/pengiriman/aturjadwal/${transaksi.id_pengiriman}/kurir`),
                fetch(`/api/pengiriman/${transaksi.id_pengiriman}`),
            ]);

            const kurirData = await kurirRes.json();
            const detailData = await detailRes.json();

            if (kurirRes.ok) setKurirList(kurirData.kurir);
            if (detailRes.ok) {
                setTransaksiDetail(detailData.transaksi);
                setShowModal(true); // Pindahkan ke sini setelah data siap
            }
        } catch (err) {
            console.error("Gagal fetch kurir atau detail:", err);
        }
    };

    const handleAturJadwalAmbil = async () => {
        if (!selectedPickupDate) {
            toast.error("Tanggal ambil harus diisi.");
            return;
        }

        const selected = new Date(selectedPickupDate);
        const lunas = new Date(transaksiDetail.tanggal_lunas);
        const batasMax = new Date(lunas);
        batasMax.setDate(batasMax.getDate() + 2);

        if (selected > batasMax) {
            toast.error("Jadwal pengambilan tidak boleh lebih dari 2 hari setelah tanggal lunas.");
            return;
        }

        try {
            const res = await fetch(`/api/pengiriman/aturjadwal/${selectedTransaksi.id_pengiriman}/jadwal-ambil`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tanggal_kirim: selectedPickupDate }),
            });

            if (!res.ok) throw new Error("Gagal mengatur jadwal ambil");

            toast.success("Jadwal pengambilan berhasil diatur.");
            setShowModal(false);
            fetchPengiriman();
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menyimpan jadwal.");
        }
    };

    const handlePenjadwalan = async () => {
        if (!selectedDate || !selectedKurir) {
            toast.error("Mohon isi semua field");
            return;
        }

        const pesanDate = new Date(selectedTransaksi.tanggal_pesan);
        const selected = new Date(selectedDate);

        const afterCutoff =
            pesanDate.toDateString() === selected.toDateString() &&
            pesanDate.getHours() >= 16;

        if (afterCutoff) {
            toast.error("Pembelian setelah jam 4 sore tidak bisa dijadwalkan di hari yang sama.");
            return;
        }

        try {
            const res = await fetch(`/api/pengiriman/aturjadwal/${selectedTransaksi.id_pengiriman}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tanggal_kirim: selectedDate,
                    id_kurir: selectedKurir,
                }),
            });

            if (!res.ok) throw new Error("Gagal menjadwalkan pengiriman");

            toast.success("Pengiriman berhasil dijadwalkan!");
            setShowModal(false);
            fetchPengiriman();
        } catch (err) {
            console.error("Gagal menjadwalkan:", err);
            toast.error("Terjadi kesalahan saat menyimpan jadwal");
        }
    };


    const statusOptions = [
        { label: "Semua", value: "ALL" },
        { label: "Butuh Kurir", value: "Butuh Kurir" },
        { label: "Menunggu Bayar", value: "Menunggu Bayar" },
        { label: "Dalam Pengiriman", value: "Dalam Pengiriman" },
        { label: "Akan Diambil", value: "Akan Diambil" },
        { label: "Selesai", value: "Selesai" },
        { label: "Gagal", value: "Gagal" },
    ];

    const handleSetDone = async (id) => {
        try {
            await fetch(`/api/pengiriman/${id}/done`, { method: "PATCH" });
            fetchPengiriman();
            toast.success("Jadwal pengambilan berhasil diatur.");
        } catch (err) {
            toast.error("Gagal update status");
        }
    };

    const handlePrintPDF = () => {
        const t = transaksiDetail;
        if (!t) return;

        const doc = new jsPDF();
        let y = 10;

        const formatCurrency = (val) => formatRupiah(val);

        const jenisPengiriman = t.jenis_pengiriman === "COURIER" ? "dibawa oleh kurir" : "diambil oleh pembeli";
        const labelTanggal = t.jenis_pengiriman === "COURIER" ? "Tanggal kirim" : "Tanggal ambil";
        const tanggalLabel = t.jenis_pengiriman === "COURIER"
            ? (t.tanggal_kirim ? formatDateTime(t.tanggal_kirim) : "-")
            : (t.tanggal_terima ? formatDateTime(t.tanggal_terima) : "-");

        const deliveryInfo = t.jenis_pengiriman === "COURIER"
            ? `Delivery: Kurir ReUseMart (${t.nama_kurir || "-"})`
            : "Delivery: - (diambil sendiri)";

        const labelX = 10;
        const valueX = 190;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("ReUse Mart", labelX, y); y += 6;
        doc.setFont("helvetica", "normal");
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", labelX, y); y += 10;

        // Transaksi info
        doc.text(`No Nota               : ${t.no_nota || "-"}`, labelX, y); y += 6;
        doc.text(`Tanggal pesan   : ${formatDateTime(t.tanggal_pesan)}`, labelX, y); y += 6;
        doc.text(`Lunas pada         : ${formatDateTime(t.tanggal_lunas)}`, labelX, y); y += 6;
        doc.text(`${labelTanggal.padEnd(20)}: ${tanggalLabel}`, labelX, y); y += 12;

        // Pembeli info
        doc.setFont("helvetica", "bold");
        doc.text(`Pembeli   : ${t.email_pembeli} / ${t.nama_pembeli}`, labelX, y); y += 6;
        doc.setFont("helvetica", "normal");
        if (t.alamat_pembeli) {
            const lines = doc.splitTextToSize(t.alamat_pembeli, 180);
            lines.forEach((line) => {
                doc.text(line, labelX, y);
                y += 6;
            });
        } else {
            doc.text("-", labelX, y); y += 6;
        }
        doc.text(deliveryInfo, labelX, y); y += 12;

        // Produk list
        if (Array.isArray(t.produk)) {
            t.produk.forEach((p) => {
                doc.text(p.nama_barang || "-", labelX, y);
                doc.text(formatCurrency(p.harga_barang), valueX, y, { align: "right" });
                y += 6;
            });
            y += 4;
        }

        // Harga detail
        const hargaAwal = Number(t.harga_awal || 0);
        const ongkosKirim = Number(t.ongkos_kirim || 0);
        const subtotal = hargaAwal + ongkosKirim;
        const potongan = Number(t.diskon || 0);
        const poinDiskon = potongan / 10000;

        doc.text("Total", labelX, y);
        doc.text(formatCurrency(hargaAwal), valueX, y, { align: "right" }); y += 6;

        doc.text("Ongkos Kirim", labelX, y);
        doc.text(formatCurrency(ongkosKirim), valueX, y, { align: "right" }); y += 6;

        doc.text("Total", labelX, y);
        doc.text(formatCurrency(subtotal), valueX, y, { align: "right" }); y += 6;

        doc.text(`Potongan ${poinDiskon} poin`, labelX, y);
        doc.text(`- ${formatCurrency(potongan)}`, valueX, y, { align: "right" }); y += 6;

        doc.setFont("helvetica", "bold");
        doc.text("Total", labelX, y);
        doc.text(formatCurrency(t.harga_akhir), valueX, y, { align: "right" }); y += 10;
        doc.setFont("helvetica", "normal");

        // Poin
        doc.text(`Poin dari pesanan ini: ${t.tambahan_poin || "-"}`, labelX, y); y += 6;
        doc.text(`Total poin customer  : ${t.poin_loyalitas || "-"}`, labelX, y); y += 10;

        // QC dan tanda tangan
        doc.text(`QC oleh: ${t.nama_petugas_cs || "-"} (${t.kode_petugas || "-"})`, labelX, y); y += 10;
        doc.text(t.jenis_pengiriman === "COURIER" ? "Diterima oleh:" : "Diambil oleh:", labelX + 7, y); y += 20;

        doc.text(`${t.nama_pembeli || "(...........................)"}`, labelX + 7, y); y += 6;
        doc.text(`Tanggal: ${t.tanggal_terima ? formatDateTime(t.tanggal_terima) : "(...........................)"}`, labelX + 7, y);


        // Save
        doc.save(`nota_${t.no_nota}.pdf`);
    };

    const filteredList = transaksiList.filter(item => {
        const matchJenis = filterJenis === "ALL" || item.jenis_pengiriman === filterJenis;
        const matchStatus = statusFilter === "ALL" || getStatusLabel(item) === statusFilter;
        return matchJenis && matchStatus;
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manajemen Pengiriman</h1>

            <div className="flex justify-between mb-4">
                <div>
                    <Tabs defaultValue="ALL">
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
                </div>
                <div>
                    <select
                        value={filterJenis}
                        onChange={(e) => setFilterJenis(e.target.value)}
                        className="border px-3 py-2 rounded"
                    >
                        <option value="ALL">Semua Pengiriman</option>
                        <option value="COURIER">COURIER</option>
                        <option value="SELF_PICKUP">SELF PICKUP</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-[100px_180px_160px_160px_160px_120px_140px_100px] text-white p-4 rounded-xl font-semibold text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                <div>Nota</div>
                <div>Nama Kurir</div>
                <div>Tanggal Pesan</div>
                <div>Tanggal Kirim/Ambil</div>
                <div>Tanggal Terima</div>
                <div>Harga</div>
                <div>Status</div>
                <div className="flex justify-center">Action</div>
            </div>

            {[...filteredList]
                .sort((a, b) => {
                    const priority = {
                        "Butuh Kurir": 1,
                        "Atur Jadwal": 2,
                        "Menunggu Bayar": 3,
                        "Sedang Diproses": 4,
                        "Akan Diambil": 5,
                        "Dalam Pengiriman": 6,
                        "Selesai": 7,
                        "Gagal": 8,
                    };

                    const labelA = getStatusLabel(a);
                    const labelB = getStatusLabel(b);
                    const rankA = priority[labelA] || 99;
                    const rankB = priority[labelB] || 99;

                    return rankA - rankB;
                })

                .map((item) => (
                    <div key={item.id_pengiriman || `${item.no_nota}-${item.nama_pembeli}`} className="grid grid-cols-[100px_180px_160px_160px_160px_120px_140px_100px] px-4 py-2 mt-3 rounded-xl border border-black text-sm">
                        <div className="truncate flex items-center">{item.no_nota}</div>
                        <div className="truncate flex items-center">
                            {item.jenis_pengiriman === "SELF_PICKUP" ? (
                                item.tanggal_terima ? "Diambil Pembeli" : "-"
                            ) : (
                                item.nama_kurir || "-"
                            )}
                        </div>
                        <div className="flex items-center">{formatDateTime(item.tanggal_pesan)}</div>
                        <div className="flex items-center">{item.tanggal_kirim ? formatDateTime(item.tanggal_kirim) : "-"}</div>
                        <div className="flex items-center">{item.tanggal_terima ? formatDateTime(item.tanggal_terima) : "-"}</div>
                        <div className="flex items-center">{formatRupiah(item.harga_akhir)}</div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status_pengiriman)}`}>
                            {getStatusLabel(item)}
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

            {showModal && selectedTransaksi && transaksiDetail && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-50">
                    <div className="bg-white w-full h-full max-w-2xl overflow-auto">

                        <div className="sticky top-0 left-0 right-0 z-20 px-6 py-4 flex justify-between items-center bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                            <h2 className="text-xl font-bold text-white">Detail Transaksi</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white hover:text-red-500 transition-colors"
                            >
                                <X />
                            </button>
                        </div>
                        <div className="p-6">

                            <div className="space-y-2">
                                <p className="font-bold">ReUse Mart</p>
                                <p>Jl. Green Eco Park No. 456 Yogyakarta</p>

                                <hr className="my-2" />

                                <p><strong>No Nota:</strong> {transaksiDetail.no_nota}</p>
                                <p><strong>Tanggal Pesan:</strong> {formatDateTime(transaksiDetail.tanggal_pesan)}</p>
                                <p><strong>Lunas pada:</strong> {formatDateTime(transaksiDetail.tanggal_lunas)}</p>
                                <p>
                                    <strong>{transaksiDetail.jenis_pengiriman === "COURIER" ? "Tanggal Kirim" : "Tanggal Ambil"}:</strong>{" "}
                                    {transaksiDetail.jenis_pengiriman === "COURIER"
                                        ? (transaksiDetail.tanggal_kirim ? formatDateTime(transaksiDetail.tanggal_kirim) : "-")
                                        : (transaksiDetail.tanggal_terima ? formatDateTime(transaksiDetail.tanggal_terima) : "-")}
                                </p>


                                <hr className="my-2" />

                                <p><strong>Pembeli:</strong> {transaksiDetail.email_pembeli} / {transaksiDetail.nama_pembeli}</p>
                                <p>{transaksiDetail.alamat_pembeli || "-"}</p>
                                <p><strong>Delivery:</strong> {transaksiDetail.jenis_pengiriman === "COURIER" ? `Kurir ReUseMart (${transaksiDetail.nama_kurir || "-"})` : "Diambil sendiri"}</p>

                                <hr className="my-2" />

                                <div>
                                    {Array.isArray(transaksiDetail.produk) && transaksiDetail.produk.map((p, i) => (
                                        <p key={i}>{p.nama_barang || "-"} - {formatRupiah(p.harga_barang)}</p>
                                    ))}
                                </div>

                                <hr className="my-2" />

                                <p><strong>Total:</strong> {formatRupiah(Number(transaksiDetail.harga_awal || 0))}</p>
                                <p><strong>Ongkos Kirim:</strong> {formatRupiah(Number(transaksiDetail.ongkos_kirim || 0))}</p>
                                <p><strong>Total:</strong> {formatRupiah(Number(transaksiDetail.harga_awal || 0) + Number(transaksiDetail.ongkos_kirim || 0))}</p>

                                {Number(transaksiDetail.diskon || 0) > 0 && (
                                    <p><strong>Potongan {Number(transaksiDetail.diskon) / 10000} poin:</strong> -{formatRupiah(transaksiDetail.diskon)}</p>
                                )}

                                <p className="font-bold"><strong>Total Bayar:</strong> {formatRupiah(transaksiDetail.harga_akhir)}</p>

                                <hr className="my-2" />

                                <p><strong>Poin dari pesanan ini:</strong> {transaksiDetail.tambahan_poin || "-"}</p>
                                <p><strong>Total poin customer:</strong> {transaksiDetail.poin_loyalitas || "-"}</p>

                                <hr className="my-2" />

                                <p><strong>QC oleh:</strong> {transaksiDetail.nama_petugas_cs || "-"} ({transaksiDetail.kode_petugas || "-"})</p>
                                <p><strong>{transaksiDetail.jenis_pengiriman === "COURIER" ? "Diterima oleh:" : "Diambil oleh:"}</strong> {transaksiDetail.nama_pembeli}</p>
                                <p><strong>Tanggal:</strong> {transaksiDetail.tanggal_terima ? formatDateTime(transaksiDetail.tanggal_terima) : "-"}</p>
                            </div>

                            <button onClick={handlePrintPDF} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                                <Printer size={16} /> Cetak PDF
                            </button>

                            {/* Penjadwalan pengiriman */}
                            {selectedTransaksi.jenis_pengiriman === "COURIER" && getStatusLabel(selectedTransaksi) === "Butuh Kurir" && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Atur Jadwal Pengiriman</label>
                                    <input
                                        type="datetime-local"
                                        value={selectedDate}
                                        min={getPengirimanMin(selectedTransaksi.tanggal_pesan)}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full border px-3 py-2 rounded mb-3"
                                    />

                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kurir</label>
                                    <select
                                        value={selectedKurir}
                                        onChange={(e) => setSelectedKurir(e.target.value)}
                                        className="w-full border px-3 py-2 rounded"
                                    >
                                        <option value="">-- Pilih Kurir --</option>
                                        {kurirList.map((kurir) => (
                                            <option key={kurir.id_pegawai} value={kurir.id_pegawai} disabled={kurir.status === "sibuk"}>
                                                {kurir.nama} {kurir.status === "sibuk" ? "[sibuk]" : ""}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handlePenjadwalan}
                                        className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded"
                                    >
                                        Simpan Jadwal
                                    </button>
                                </div>
                            )}

                            {selectedTransaksi.jenis_pengiriman === "SELF_PICKUP" &&
                                selectedTransaksi.status_pengiriman === "IN_PROGRESS" &&
                                selectedTransaksi.status_pembayaran === "CONFIRMED" && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Atur Jadwal Pengambilan</label>
                                        <input
                                            type="datetime-local"
                                            value={selectedPickupDate}
                                            min={transaksiDetail.tanggal_lunas?.slice(0, 16)}
                                            max={(() => {
                                                const maxDate = new Date(transaksiDetail.tanggal_lunas);
                                                maxDate.setDate(maxDate.getDate() + 2);
                                                return new Date(maxDate.getTime() - maxDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                            })()}
                                            onChange={(e) => setSelectedPickupDate(e.target.value)}
                                            className="w-full border px-3 py-2 rounded mb-3"
                                        />

                                        <button
                                            onClick={handleAturJadwalAmbil}
                                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded"
                                        >
                                            Simpan Jadwal Ambil
                                        </button>
                                    </div>
                                )}



                            {/* Tombol status selesai */}
                            {selectedTransaksi.jenis_pengiriman === "COURIER" && getStatusLabel(selectedTransaksi) === "Dalam Pengiriman" && (
                                <button
                                    onClick={() => handleSetDone(selectedTransaksi.id_pengiriman)}
                                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    Tandai Selesai
                                </button>
                            )}

                            {selectedTransaksi.jenis_pengiriman === "SELF_PICKUP" && getStatusLabel(selectedTransaksi) !== "Selesai" && (
                                <button
                                    onClick={() => handleSetDone(selectedTransaksi.id_pengiriman)}
                                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    Sudah Diambil
                                </button>
                            )}

                            {selectedTransaksi.jenis_pengiriman === "SELF_PICKUP" &&
                                selectedTransaksi.status_pembayaran === "CONFIRMED" &&
                                !selectedTransaksi.tanggal_terima &&
                                (() => {
                                    const tglLunas = new Date(selectedTransaksi.tanggal_lunas);
                                    const now = new Date();
                                    const selisih = Math.floor((now - tglLunas) / (1000 * 60 * 60 * 24));
                                    return selisih > 2;
                                })() && (
                                    <button
                                        onClick={() => handleCancelIfLate(selectedTransaksi.id_transaksi)}
                                        className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded"
                                    >
                                        Batalkan & Tandai Donasi
                                    </button>
                                )
                            }

                        </div>

                    </div>
                </div>
            )}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName="bg-white text-gray-800 shadow-md rounded-lg px-4 py-3"
                bodyClassName="text-sm font-medium bg-gray-800"
            />

        </div>
    );
}