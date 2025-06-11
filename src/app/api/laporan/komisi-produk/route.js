import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.kode_produk,
        b.nama_barang,
        b.harga_barang,
        b.id_petugas_hunter,
        t.harga_akhir AS harga_jual,
        b.tanggal_keluar,
        t.tanggal_lunas AS tanggal_laku,
        k.komisi_hunter,
        k.komisi_reusemart
      FROM barang b
      JOIN komisi k ON k.id_barang = b.id_barang
      JOIN bridgebarangtransaksi bt ON b.id_barang = bt.id_barang
      JOIN transaksi t ON bt.id_transaksi = t.id_transaksi
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      WHERE b.status_titip = 'SOLD'
    `);

    const data = rows.map((row) => {
      const harga_barang = Number(row.harga_barang || 0);
      const komisi_reusemart = Number(row.komisi_reusemart || 0);
      const komisi_hunter = Number(row.komisi_hunter || 0);

      const tglMasuk = new Date(row.tanggal_masuk);
      const tglLaku = new Date(row.tanggal_laku);
      const diffInDays = Math.floor((tglLaku - tglMasuk) / (1000 * 60 * 60 * 24));

      const adaHunter = !!row.id_petugas_hunter;

      // Untuk menghitung ulang komisi reusemart tanpa bonus
      const persentase_reusemart = adaHunter ? 0.15 : 0.2;
      const komisi_reusemart_awal = harga_barang * persentase_reusemart;

      let bonus_penitip = 0;
      if (diffInDays < 7) {
        bonus_penitip = komisi_reusemart_awal * 0.1;
      }

      return {
        kode_produk: row.kode_produk,
        nama_produk: row.nama_barang,
        harga_jual: row.harga_jual,
        tanggal_masuk: row.tanggal_masuk,
        tanggal_laku: row.tanggal_keluar,
        komisi_hunter,
        komisi_reusemart,
        bonus_penitip,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching komisi produk:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
