"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, BarChart2, Box, AlertTriangle, Download } from "lucide-react";
import { useRef } from "react";
import Chart from 'chart.js/auto';
import BarChartJt from "@/components/BarChartJt";
import PieChartJt from "@/components/PieChartJt";

function StatCard({ title, value, growth, icon }) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-green-600">{growth}</p>
            </div>
        </div>
    );
}

function ChartWithTotal({ title, totalValue, chartComponent, onDownload }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button className="bg-indigo-600 text-white p-2 rounded" onClick={onDownload}><Download size={20} /></button>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-indigo-700">{totalValue}</div>
                </div>
                {chartComponent}
            </CardContent>
        </Card>
    );
}


export default function AdminDashboardPage() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);

    const [data, setData] = useState({});
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const [selectedMonth, setSelectedMonth] = useState("ALL");
    const monthOptions = [
        { value: "ALL", label: "Semua Bulan" },
        { value: "01", label: "Januari" },
        { value: "02", label: "Februari" },
        { value: "03", label: "Maret" },
        { value: "04", label: "April" },
        { value: "05", label: "Mei" },
        { value: "06", label: "Juni" },
        { value: "07", label: "Juli" },
        { value: "08", label: "Agustus" },
        { value: "09", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" },
    ];


    const formatCurrency = (value) => `Rp ${Math.round(value).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2020; year <= currentYear + 1; year++) {
            years.push(year);
        }
        setAvailableYears(years);
    }, []);

    const fetchData = async (tahun, bulan) => {
        const url = new URL("/api/laporan/dashboard", window.location.origin);
        url.searchParams.set("tahun", tahun);
        if (bulan && bulan !== "ALL") {
            url.searchParams.set("bulan", bulan);
        }

        try {
            const response = await fetch(url.toString());
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useEffect(() => {
        fetchData(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);


    const formatToJuta = (value) => {
        const juta = value / 1_000_000;
        return `Rp ${juta.toFixed(1)} jt`;
    };


    const generateBarChartImage = async (data) => {
        return new Promise((resolve) => {
            const ctx = chartRef.current.getContext('2d');

            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            chartInstanceRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.bulan),
                    datasets: [{
                        label: 'Penjualan (Rp)',
                        data: data.map(d => d.jumlah_penjualan),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    }]
                },
                options: {
                    animation: false,
                    responsive: false,
                    scales: {
                        y: {
                            ticks: {
                                callback: (value) => formatToJuta(value)
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

            setTimeout(() => {
                const imgData = chartRef.current.toDataURL('image/png');
                resolve(imgData);
            }, 500);
        });
    };

    const lengkapiBulanPenjualan = (rawTable) => {
        const semuaBulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const map = Object.fromEntries(
            rawTable.map(row => [row[0], { jumlah_terjual: row[1], jumlah_penjualan: row[2] }])
        );

        return semuaBulan.map(bulan => ({
            bulan,
            jumlah_terjual: Number(map[bulan]?.jumlah_terjual) || 0,
            jumlah_penjualan: Number(map[bulan]?.jumlah_penjualan) || 0,

        }));
    };

    const penjualanLengkap = lengkapiBulanPenjualan(data.penjualanTable || []);


    const downloadPenjualanBulananPDF = async (tableData, tahun) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
        doc.setFontSize(14);
        doc.text("LAPORAN PENJUALAN BULANAN", 14, 30);

        doc.setFontSize(12);
        doc.text(`Tahun : ${tahun}`, 14, 38);
        doc.text(`Tanggal cetak: ${today}`, 14, 44);

        const formattedTable = tableData.map(d => [
            d.bulan || "-",
            Math.round(d.jumlah_terjual ?? 0).toLocaleString("id-ID"),
            Math.round(d.jumlah_penjualan ?? 0).toLocaleString("id-ID")
        ]);

        const totalJumlah = tableData.reduce((sum, d) => sum + (d.jumlah_terjual || 0), 0);
        const totalPenjualan = tableData.reduce((sum, d) => sum + (d.jumlah_penjualan || 0), 0);

        autoTable(doc, {
            startY: 50,
            head: [["Bulan", "Jumlah Barang Terjual", "Jumlah Penjualan Kotor"]],
            body: [
                ...formattedTable,
                ["Total", Math.round(totalJumlah).toLocaleString("id-ID"), Math.round(totalPenjualan).toLocaleString("id-ID")]
            ],
            styles: { halign: 'center' },
            headStyles: { fillColor: [40, 40, 40] },
            didParseCell: function (data) {
                if (data.row.index === formattedTable.length) {
                    data.cell.styles.fillColor = [220, 220, 220];
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [0, 0, 0];
                }
            }
        });

        const chartImage = await generateBarChartImage(tableData);
        doc.addPage();
        doc.addImage(chartImage, 'PNG', 10, 20, 190, 100);

        doc.save(`Laporan_Penjualan_Bulanan_${tahun}.pdf`);
    };


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return "-";
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const downloadPDFKomisi = (tableData, tahun, bulan = null) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        const bulanNama = bulan ? new Date(`${tahun}-${bulan}-01`).toLocaleString("id-ID", { month: "long" }) : "Semua Bulan";

        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
        doc.setFontSize(14);
        doc.text("LAPORAN KOMISI PER PRODUK", 14, 30);

        doc.setFontSize(12);
        doc.text(`Tahun : ${tahun}`, 14, 38);
        doc.text(`Bulan : ${bulanNama}`, 14, 44);
        doc.text(`Tanggal cetak: ${today}`, 14, 50);

        const formattedTable = tableData.map((d) => [
            d.kode_produk,
            d.nama_barang,
            formatCurrency(d.harga_jual),
            formatDate(d.tanggal_masuk),
            formatDate(d.tanggal_laku),
            formatCurrency(d.komisi_hunter),
            formatCurrency(d.komisi_reusemart),
            formatCurrency(d.bonus_penitip),
        ]);

        const totalHarga = tableData.reduce((sum, d) => sum + (d.harga_jual || 0), 0);
        const totalHunter = tableData.reduce((sum, d) => sum + (d.komisi_hunter || 0), 0);
        const totalReusemart = tableData.reduce((sum, d) => sum + (d.komisi_reusemart || 0), 0);
        const totalPenitip = tableData.reduce((sum, d) => sum + (d.bonus_penitip || 0), 0);

        autoTable(doc, {
            startY: 60,
            head: [[
                "Kode Produk", "Nama Produk", "Harga Jual",
                "Tanggal Masuk", "Tanggal Laku",
                "Komisi Hunter", "Komisi ReUse Mart", "Bonus Penitip"
            ]],
            body: [
                ...formattedTable,
                [
                    "Total", "", formatCurrency(totalHarga),
                    "", "", formatCurrency(totalHunter), formatCurrency(totalReusemart), formatCurrency(totalPenitip)
                ],
            ],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [40, 40, 40], halign: "center" },
            bodyStyles: { halign: "center" },
        });

        doc.save(`Laporan_Komisi_${tahun}_${bulan || 'Semua'}.pdf`);
    };


    const downloadPDFStok = (tableData) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
        doc.setFontSize(14);
        doc.text("LAPORAN STOK GUDANG", 14, 30);
        doc.setFontSize(12);
        doc.text(`Tanggal cetak: ${today}`, 14, 38);

        const formattedTable = tableData.map(d => [
            d.kode_produk,
            d.nama_barang,
            d.id,
            d.nama_penitip,
            formatDate(d.tanggal_masuk),
            d.perpanjangan,
            d.id_hunter || "-",
            d.nama_hunter || "-",
            formatCurrency(d.harga_barang),
        ]);

        autoTable(doc, {
            startY: 50,
            head: [[
                "Kode Produk", "Nama Produk", "ID Penitip", "Nama Penitip",
                "Tanggal Masuk", "Perpanjangan", "ID Hunter", "Nama Hunter", "Harga"
            ]],
            body: formattedTable,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [40, 40, 40], halign: "center" },
            bodyStyles: { halign: "center" },
        });

        doc.save("Laporan_Stok_Gudang.pdf");
    };

    const downloadPDFPenjualanPerKategori = (kategoriTable = [], tahun) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);

        doc.setFontSize(14);
        doc.text("LAPORAN PENJUALAN PER KATEGORI", 14, 30);
        doc.setFontSize(12);
        doc.text(`Tahun : ${tahun}`, 14, 38);
        doc.text(`Tanggal cetak: ${today}`, 14, 44);

        const totalTerjual = kategoriTable.reduce((sum, row) => sum + Number(row[1] || 0), 0);
        const totalGagal = kategoriTable.reduce((sum, row) => sum + Number(row[2] || 0), 0);

        const tableBody = kategoriTable.map(row => [
            row[0],
            row[1].toLocaleString("id-ID"),
            row[2].toLocaleString("id-ID")
        ]);

        const totalRow = [
            "TOTAL",
            totalTerjual.toLocaleString("id-ID"),
            totalGagal.toLocaleString("id-ID")
        ];

        autoTable(doc, {
            startY: 50,
            head: [["Kategori", "Jumlah Item Terjual", "Jumlah Item Gagal Terjual"]],
            body: [...tableBody, totalRow],
            styles: { fontSize: 10, halign: "center" },
            headStyles: { fillColor: [40, 40, 40] },
            didParseCell: function (data) {
                if (data.row.index === tableBody.length) {
                    data.cell.styles.fillColor = [220, 220, 220];
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [0, 0, 0];
                }
            }
        });

        doc.save("Laporan_Penjualan_Per_Kategori.pdf");
    };




    const downloadPDFBarangExpired = (expiredPDFTable = []) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        // Header
        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
        doc.setFontSize(14);
        doc.text("LAPORAN BARANG MASA TITIP HABIS", 14, 30);
        doc.setFontSize(12);
        doc.text(`Tanggal cetak: ${today}`, 14, 38);

        // Tabel
        autoTable(doc, {
            startY: 50,
            head: [[
                "Kode Produk",
                "Nama Produk",
                "ID Penitip",
                "Nama Penitip",
                "Tanggal Masuk",
                "Tanggal Akhir",
                "Batas Ambil"
            ]],
            body: expiredPDFTable,
            styles: { fontSize: 9, halign: "center" },
            headStyles: { fillColor: [40, 40, 40] },
            margin: { left: 10, right: 10 },
        });

        doc.save("Laporan_Barang_Masa_Titip_Habis.pdf");
    };

    const downloadPDFDonasi = (donasiPDFTable = []) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        // Header
        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
        doc.setFontSize(14);
        doc.text("LAPORAN Donasi Barang", 14, 30);
        doc.setFontSize(12);
        doc.text(`Tanggal cetak: ${today}`, 14, 38);

        // Tabel
        autoTable(doc, {
            startY: 50,
            head: [[
                "Kode Produk",
                "Nama Produk",
                "ID Penitip",
                "Nama Penitip",
                "Tanggal Donasi",
                "Organisasi",
                "Nama Penerima"
            ]],
            body: donasiPDFTable,
            styles: { fontSize: 9, halign: "center" },
            headStyles: { fillColor: [40, 40, 40] },
            margin: { left: 10, right: 10 },
        });

        doc.save("Laporan_Barang_Donasi.pdf");
    };


    const downloadPDFRequestDonasi = (reqdonasiPDFTable = []) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        doc.setFontSize(12);
        doc.text("ReUse Mart", 14, 14);
        doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);

        doc.setFontSize(14);
        doc.text("LAPORAN REQUEST DONASI", 14, 30);

        doc.setFontSize(12);
        doc.text(`Tanggal cetak: ${today}`, 14, 38);

        autoTable(doc, {
            startY: 50,
            head: [["ID Organisasi", "Nama", "Alamat", "Request"]],
            body: reqdonasiPDFTable,
            styles: { fontSize: 9, halign: "center" },
            headStyles: { fillColor: [40, 40, 40] },
            margin: { left: 10, right: 10 },
        });

        doc.save("Laporan_Request_Donasi.pdf");
    };



    const uniquePenitips = new Map();
    data.transaksipenitip?.forEach(d => {
        if (!uniquePenitips.has(d.id_penitip)) {
            uniquePenitips.set(d.id_penitip, d.nama_penitip);
        }
    });

    const handleDownloadPenitipPDF = async (id_penitip) => {
        try {
            const res = await fetch(`/api/laporan/transaksi-penitip/${id_penitip}`);
            const data = await res.json();

            if (!data.success) {
                alert("Gagal mengambil data transaksi penitip.");
                return;
            }

            const { id_penitip: id, nama_penitip: nama, bulan, tahun, items } = data;

            if (!Array.isArray(items) || items.length === 0) {
                alert("Data transaksi penitip kosong.");
                return;
            }

            const doc = new jsPDF();
            const today = new Date().toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric"
            });

            doc.setFontSize(12);
            doc.text("ReUse Mart", 14, 14);
            doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);

            doc.setFontSize(14);
            doc.text("LAPORAN TRANSAKSI PENITIP", 14, 30);

            doc.setFontSize(12);
            doc.text(`ID Penitip : ${id}`, 14, 38);
            doc.text(`Nama Penitip : ${nama}`, 14, 44);
            doc.text(`Bulan : ${bulan}`, 14, 50);
            doc.text(`Tahun : ${tahun}`, 14, 56);
            doc.text(`Tanggal cetak: ${today}`, 14, 62);

            const body = items.map(d => [
                d.kode_produk,
                d.nama_barang,
                new Date(d.tanggal_masuk).toLocaleDateString("id-ID"),
                new Date(d.tanggal_laku).toLocaleDateString("id-ID"),
                d.harga_jual_bersih.toLocaleString("id-ID"),
                d.bonus_terjual_cepat.toLocaleString("id-ID"),
                d.pendapatan.toLocaleString("id-ID")
            ]);

            const total = items.reduce((acc, item) => acc + item.pendapatan, 0);

            autoTable(doc, {
                startY: 70,
                head: [[
                    "Kode Produk", "Nama Produk", "Tanggal Masuk", "Tanggal Laku",
                    "Harga Jual Bersih", "Bonus Terjual Cepat", "Pendapatan"
                ]],
                body: [
                    ...body,
                    ["", "", "", "", "", "TOTAL", total.toLocaleString("id-ID")]
                ],
                styles: { fontSize: 9, halign: "center" },
                headStyles: { fillColor: [40, 40, 40] },
                columnStyles: {
                    4: { halign: "right" },
                    5: { halign: "right" },
                    6: { halign: "right", fontStyle: "bold" }
                },
                didDrawCell: (data) => {
                    if (data.row.index === body.length && data.column.index === 6) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            doc.save(`Laporan_Transaksi_${nama}.pdf`);
        } catch (err) {
            console.error("Gagal unduh PDF transaksi penitip:", err);
            alert("Terjadi kesalahan saat membuat laporan.");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-800">Laporan Dashboard Admin</h2>
            <div className="flex justify-end">
                <div className="">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="ALL">Semua Tahun</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>

                    <ChartWithTotal
                        title={`Penjualan Bulanan ${selectedYear}`}
                        totalValue={formatCurrency(
                            penjualanLengkap.reduce((sum, d) => sum + d.jumlah_penjualan, 0)
                        )}

                        chartComponent={
                            <BarChartJt
                                data={penjualanLengkap.map(d => ({ name: d.bulan, value: d.jumlah_penjualan }))}
                            />
                        }
                        onDownload={() => downloadPenjualanBulananPDF(penjualanLengkap, selectedYear)}
                    />
                </div>
                {/*                 
                <ChartWithTotal
                    title="Penjualan Bulanan"
                    totalValue={formatCurrency(
                        penjualanLengkap.reduce((sum, d) => sum + d.jumlah_penjualan, 0)
                    )}
                    chartComponent={
                        <BarChartJt
                            data={penjualanLengkap.map(d => ({ name: d.bulan, value: d.jumlah_penjualan }))}
                        />
                    }
                    onDownload={() => downloadPenjualanBulananPDF(penjualanLengkap)}
                /> */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    <StatCard title="Total Penjualan" value={formatCurrency(data.penjualan?.reduce((sum, d) => sum + d.value, 0) || 0)} growth="+21%" icon={<DollarSign size={16} />} />
                    <StatCard title="Total Komisi" value={formatCurrency(data.komisi?.reduce((sum, d) => sum + d.value, 0) || 0)} growth="+14%" icon={<BarChart2 size={16} />} />
                    <StatCard title="Stok Gudang" value={`${data.stok?.reduce((sum, d) => sum + d.value, 0) || 0} barang`} growth="-8%" icon={<Box size={16} />} />
                    <StatCard title="Barang Expired" value={`${data.expired?.length || 0} barang`} growth="!" icon={<AlertTriangle size={16} />} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardContent className="p-4 overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Request Donasi</h3>
                            <button
                                className="bg-indigo-600 text-white p-2 rounded"
                                onClick={() => downloadPDFRequestDonasi(data.reqdonasiPDFTable || [])}
                            >
                                <Download size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-[1fr_200px] bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-3 rounded-lg font-semibold text-sm">
                            <div>Organisasi</div>
                            <div>Deskripsi</div>
                        </div>

                        <div className="max-h-64 overflow-y-auto border rounded-b-md">
                            {data.reqdonasi && data.reqdonasi.length > 0 ? (
                                data.reqdonasi.map((item, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-[1fr_200px] p-3 border-b text-sm items-center"
                                    >
                                        <div>{item.nama_organisasi}</div>
                                        <div>{item.deskripsi}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    Belum ada request donasi
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>


                <ChartWithTotal
                    title="Penjualan per Kategori"
                    chartComponent={
                        data.kategori && data.kategori.length > 0 ? (
                            <PieChartJt data={data.kategori} />
                        ) : (
                            <p className="text-sm text-center text-gray-500 mt-4">Tidak ada data Penjualan per Kategori</p>
                        )
                    }
                    onDownload={() =>
                        downloadPDFPenjualanPerKategori(data.kategoriTable || [], selectedYear)
                    }
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                {/* Kolom 1 - Transaksi Penitip */}
                <Card>
                    <CardContent className="p-4 overflow-auto h-full flex flex-col">
                        <h3 className="font-semibold text-xl mb-4">Transaksi Penitip</h3>
                        {uniquePenitips.size > 0 ? (
                            [...uniquePenitips.entries()].map(([id, nama], i) => (
                                <div key={i} className="flex justify-between items-center border-b py-2">
                                    <span className="text-sm px-2 truncate whitespace-nowrap overflow-hidden">{nama}</span>
                                    <button
                                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                                        onClick={() => handleDownloadPenitipPDF(id)}
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                Tidak ada data Transaksi Penitip
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Kolom 2 - Stok & Komisi */}
                <div className="col-span-2 flex flex-col gap-4">
                    {/* Komisi per Produk */}
                    <Card className="flex-grow">
                        <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-xl">Komisi per Produk</h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                    >
                                        {monthOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="bg-indigo-600 text-white p-2 rounded flex items-center gap-2"
                                        onClick={() =>
                                            downloadPDFKomisi(data.komisiFullTable || [], selectedYear, selectedMonth !== "ALL" ? selectedMonth : null)
                                        }
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-[160px_1fr_200px] bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-3 rounded-t-lg font-semibold text-sm">
                                <div>Kode Produk</div>
                                <div>Nama Barang</div>
                                <div>Harga Jual</div>
                            </div>
                            <div className="max-h-64 overflow-y-auto rounded-b-md border">
                                {data.komisiTable && data.komisiTable.length > 0 ? (
                                    data.komisiTable.map((item, i) => (
                                        <div key={i} className="grid grid-cols-[160px_1fr_200px] p-3 border-b text-sm items-center">
                                            <div>{item[0]}</div>
                                            <div>{item[1]}</div>
                                            <div>{formatCurrency(item[2])}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        Tidak ada data Komisi Produk
                                    </div>
                                )}

                            </div>
                        </CardContent>
                    </Card>

                    {/* Stok Gudang */}
                    <Card className="flex-grow">
                        <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-xl">Stok Gudang</h3>
                                <button
                                    className="bg-indigo-600 text-white p-2 rounded flex items-center gap-2"
                                    onClick={() => downloadPDFStok(data.stokFullTable || [])}
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-[1fr_200px] bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-3 rounded-t-lg font-semibold text-sm">
                                <div>Nama Barang</div>
                                <div>Kategori</div>
                            </div>
                            <div className="max-h-64 overflow-y-auto border rounded-b-md">

                                {data.stokTable && data.stokTable.length > 0 ? (
                                    data.stokTable.map((item, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_200px] p-3 border-b text-sm items-center">
                                            <div>{item[0]}</div>
                                            <div>{item[1]}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        Tidak ada data Stok Gudang
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Kolom 3 - Expired & Donasi */}
                <div className="col-span-1 flex flex-col gap-4">
                    {/* Barang Expired */}
                    <Card className="flex-grow">
                        <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-xl">Barang Expired</h3>
                                <button
                                    className="bg-indigo-600 text-white p-2 rounded self-start"
                                    onClick={() => downloadPDFBarangExpired(data.expiredPDFTable || [])}
                                >
                                    <Download size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-[80px_1fr] bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-3 rounded-t-lg font-semibold text-sm">
                                <div className="px-2">Kode Produk</div>
                                <div className="px-2">Nama Barang</div>
                            </div>

                            <div className="max-h-64 overflow-y-auto border rounded-b-md">
                                {data.expiredTable && data.expiredTable.length > 0 ? (
                                    data.expiredTable.map((item, i) => (
                                        <div
                                            key={i}
                                            className="grid grid-cols-[80px_1fr] p-3 border-b text-sm items-center"
                                        >
                                            <div className="px-2 truncate whitespace-nowrap overflow-hidden">
                                                {item.kode_produk}
                                            </div>
                                            <div className="px-2 truncate whitespace-nowrap overflow-hidden">
                                                {item.nama_barang}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        Tidak ada data Barang Expired
                                    </div>
                                )}

                            </div>
                        </CardContent>
                    </Card>

                    {/* Donasi Barang */}
                    <Card className="flex-grow">
                        <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-xl">Donasi Barang</h3>
                                <button
                                    className="bg-indigo-600 text-white p-2 rounded self-start"
                                    onClick={() => downloadPDFDonasi(data.donasiPDFTable || [])}
                                >
                                    <Download size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-[1fr_200px] bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-3 rounded-t-lg font-semibold text-sm">
                                <div className="px-2">Nama Barang</div>
                                <div className="px-2">Organisasi</div>
                            </div>

                            <div className="max-h-64 overflow-y-auto border rounded-b-md">
                                {data.donasiTable && data.donasiTable.length > 0 ? (
                                    data.donasiTable.map((item, i) => (
                                        <div
                                            key={i}
                                            className="grid grid-cols-[1fr_160px] p-2 border-b text-sm items-center"
                                        >
                                            <div className="px-2 truncate whitespace-nowrap overflow-hidden">
                                                {item.nama_barang}
                                            </div>
                                            <div className="px-2 truncate whitespace-nowrap overflow-hidden">
                                                {item.nama_organisasi}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        Tidak ada data Donasi Barang
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            <canvas ref={chartRef} width="800" height="400" style={{ display: "none" }} />
        </div >
    );
}
