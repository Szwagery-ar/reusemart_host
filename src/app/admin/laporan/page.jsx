"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPage() {
    const [penjualan, setPenjualan] = useState([]);
    const [expiredItems, setExpiredItems] = useState([]);

    useEffect(() => {
        fetch("/api/laporan/penjualan")
            .then(res => res.json()).then(data => setPenjualan(data));

        fetch("/api/laporan/penitipan-expired")
            .then(res => res.json()).then(data => setExpiredItems(data));
    }, []);

    const generatePDFPenjualan = () => {
        const doc = new jsPDF();
        doc.text("Laporan Penjualan per Kategori", 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [["Kategori", "Jumlah Terjual", "Total Penjualan"]],
            body: penjualan.map(p => [p.kategori, p.total_terjual, `Rp ${p.total_penjualan}`]),
        });
        doc.save("Laporan_Penjualan_Kategori.pdf");
    };

    const generatePDFExpired = () => {
        const doc = new jsPDF();
        doc.text("Laporan Barang Titipan Expired", 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [["Nama Barang", "Penitip", "Masuk", "Expire", "Status"]],
            body: expiredItems.map(b => [b.nama_barang, b.nama_penitip, b.tanggal_masuk, b.tanggal_expire, b.status]),
        });
        doc.save("Laporan_Penitipan_Expired.pdf");
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">📊 Laporan</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Laporan Penjualan per Kategori</h2>
                <button onClick={generatePDFPenjualan} className="px-4 py-2 bg-blue-600 text-white rounded">Unduh PDF</button>
                <table className="mt-4 w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th>Kategori</th><th>Jumlah Terjual</th><th>Total Penjualan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {penjualan.map((item, idx) => (
                            <tr key={idx} className="text-center">
                                <td>{item.kategori}</td>
                                <td>{item.total_terjual}</td>
                                <td>Rp {item.total_penjualan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Laporan Barang Titipan Expired</h2>
                <button onClick={generatePDFExpired} className="px-4 py-2 bg-red-600 text-white rounded">Unduh PDF</button>
                <table className="mt-4 w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th>Nama Barang</th><th>Penitip</th><th>Tgl Masuk</th><th>Tgl Expire</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expiredItems.map((item, idx) => (
                            <tr key={idx} className="text-center">
                                <td>{item.nama_barang}</td>
                                <td>{item.nama_penitip}</td>
                                <td>{item.tanggal_masuk}</td>
                                <td>{item.tanggal_expire}</td>
                                <td>{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
