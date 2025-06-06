import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        p.id_pengiriman,
        p.status_pengiriman,
        p.tanggal_kirim,
        p.tanggal_terima,
        p.jenis_pengiriman,
        t.no_nota,
        t.tanggal_pesan,
        t.tanggal_lunas,
        t.harga_akhir,
        pembeli.nama AS nama_pembeli,
        peg.nama AS nama_kurir,
        bayar.status_pembayaran
      FROM pengiriman p
      JOIN transaksi t ON p.id_transaksi = t.id_transaksi
      JOIN pembeli ON t.id_pembeli = pembeli.id_pembeli
      JOIN pembayaran pb on t.id_transaksi = pb.id_transaksi
      LEFT JOIN pegawai peg ON p.id_petugas_kurir = peg.id_pegawai
      LEFT JOIN pembayaran bayar ON t.id_transaksi = bayar.id_transaksi
      WHERE pb.status_pembayaran IN ('CONFIRMED')
        AND p.tanggal_kirim IS NULL
    `);

        return NextResponse.json({ pengiriman: rows });
    } catch (err) {
        console.error("GET /api/pengiriman/aturjadwal error:", err);
        return NextResponse.json({ error: "Gagal mengambil data pengiriman" }, { status: 500 });
    }
}
