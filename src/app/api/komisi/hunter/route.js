import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                b.nama_barang,
                pb.tanggal_masuk AS tanggal_titip,
                h.nama AS nama_hunter,
                b.status_titip,
                k.komisi_hunter,
                t.tanggal_lunas
            FROM komisi k
            JOIN transaksi t ON k.id_transaksi = t.id_transaksi
            JOIN bridgebarangtransaksi bt ON t.id_transaksi = bt.id_transaksi
            JOIN barang b ON bt.id_barang = b.id_barang
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            JOIN pegawai h ON k.id_petugas_hunter = h.id_pegawai
            WHERE k.id_petugas_hunter = 11
            AND t.status_transaksi = 'DONE'
            AND t.tanggal_lunas IS NOT NULL
            AND t.tanggal_lunas >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            ORDER BY t.tanggal_lunas DESC

        `);

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error("Gagal mengambil data komisi hunter:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
