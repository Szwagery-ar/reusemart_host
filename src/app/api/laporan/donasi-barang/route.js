import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        b.kode_produk,
        b.nama_barang,
        p.id_penitip,
        p.nama AS nama_penitip,
        d.tanggal_donasi,
        o.nama AS nama_organisasi,
        d.nama_penerima
      FROM donasi d
      JOIN barang b ON d.id_barang = b.id_barang
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      JOIN penitip p ON pb.id_penitip = p.id_penitip
      JOIN organisasi o ON d.id_organisasi = o.id_organisasi
    `);

        const data = rows.map(row => ({
            kode_produk: row.kode_produk,
            nama_produk: row.nama_barang,
            id_penitip: row.id_penitip,
            nama_penitip: row.nama_penitip,
            tanggal_donasi: row.tanggal_donasi,
            nama_organisasi: row.nama_organisasi,
            penerima: row.nama_penerima
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching donasi barang:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
