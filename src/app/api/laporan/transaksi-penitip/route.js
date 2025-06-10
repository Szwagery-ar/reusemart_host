import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        p.id_penitip,
        p.nama AS nama_penitip,
        MONTHNAME(t.tanggal_lunas) AS bulan,
        b.kode_produk,
        b.nama_barang,
        pb.tanggal_masuk,
        t.tanggal_lunas AS tanggal_laku,
        t.harga_akhir,
        b.komisi_reusemart,
        b.bonus_penitip
      FROM barang b
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      JOIN penitip p ON pb.id_penitip = p.id_penitip
      JOIN bridgebarangtransaksi bt ON b.id_barang = bt.id_barang
      JOIN transaksi t ON bt.id_transaksi = t.id_transaksi
      WHERE b.status_titip = 'SOLD'
    `);

        const data = rows.map(row => {
            const harga_jual_bersih = row.harga_akhir - (row.komisi_reusemart || 0);
            const pendapatan = harga_jual_bersih + (row.bonus_penitip || 0);

            return {
                id_penitip: row.id_penitip,
                nama_penitip: row.nama_penitip,
                bulan: row.bulan,
                kode_produk: row.kode_produk,
                nama_produk: row.nama_barang,
                tanggal_masuk: row.tanggal_masuk,
                tanggal_laku: row.tanggal_laku,
                harga_jual_bersih,
                bonus_terjual_cepat: row.bonus_penitip,
                pendapatan
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching transaksi penitip:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
