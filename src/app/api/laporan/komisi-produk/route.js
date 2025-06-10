import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        b.kode_produk,
        b.nama_barang,
        t.harga_akhir AS harga_jual,
        pb.tanggal_masuk,
        t.tanggal_lunas AS tanggal_laku,
        b.komisi_hunter,
        b.komisi_reusemart,
        b.bonus_penitip
      FROM barang b
      JOIN bridgebarangtransaksi bt ON b.id_barang = bt.id_barang
      JOIN transaksi t ON bt.id_transaksi = t.id_transaksi
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      WHERE b.status_titip = 'SOLD'
    `);

        const data = rows.map(row => ({
            kode_produk: row.kode_produk,
            nama_produk: row.nama_barang,
            harga_jual: row.harga_jual,
            tanggal_masuk: row.tanggal_masuk,
            tanggal_laku: row.tanggal_laku,
            komisi_hunter: row.komisi_hunter,
            komisi_reusemart: row.komisi_reusemart,
            bonus_penitip: row.bonus_penitip
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching komisi produk:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
