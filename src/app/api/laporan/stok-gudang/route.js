import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        b.kode_produk,
        b.nama_barang,
        b.harga_barang,
        pb.tanggal_masuk,
        CASE WHEN b.status_titip = 'EXTENDED' THEN 'Ya' ELSE 'Tidak' END AS perpanjangan,
        p.id_penitip,
        p.nama AS nama_penitip,
        q.id_pegawai AS id_hunter,
        q.nama AS nama_hunter
      FROM barang b
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      JOIN penitip p ON pb.id_penitip = p.id_penitip
      LEFT JOIN pegawai q ON b.id_petugas_hunter = q.id_pegawai
      WHERE b.status_titip IN ('AVAILABLE', 'EXTENDED', 'EXPIRED')
    `);

        const data = rows.map(row => ({
            kode_produk: row.kode_produk,
            nama_produk: row.nama_barang,
            id_penitip: row.id_penitip,
            nama_penitip: row.nama_penitip,
            tanggal_masuk: row.tanggal_masuk,
            perpanjangan: row.perpanjangan,
            id_hunter: row.id_hunter,
            nama_hunter: row.nama_hunter,
            harga: row.harga_barang
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching stok gudang:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
