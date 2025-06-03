import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, context) {
  const { id } = context.params;

  try {
    const [result] = await pool.query(
      `SELECT 
                t.id_transaksi,
                t.no_nota,
                t.tanggal_pesan,
                t.tanggal_lunas,
                t.status_transaksi,
                t.harga_awal,
                t.ongkos_kirim,
                t.diskon,
                t.harga_akhir,
                t.tambahan_poin,

                p.email AS email_pembeli,
                p.nama AS nama_pembeli,
                p.poin_loyalitas,
                a.lokasi AS alamat_pembeli,

                pg.jenis_pengiriman,
                pg.tanggal_kirim,
                pg.tanggal_terima,
                pg.status_pengiriman,

                k.nama AS nama_kurir,

                cs.nama AS nama_petugas_cs,
                cs.id AS kode_petugas,

                pb.status_pembayaran,
                pb.img_bukti_transfer,
                pb.deadline

                FROM pengiriman pg
                JOIN transaksi t ON pg.id_transaksi = t.id_transaksi
                JOIN pembeli p ON t.id_pembeli = p.id_pembeli
                LEFT JOIN alamat a ON pg.id_alamat = a.id_alamat
                LEFT JOIN pegawai k ON pg.id_petugas_kurir = k.id_pegawai
                LEFT JOIN pembayaran pb ON pb.id_transaksi = t.id_transaksi
                LEFT JOIN pegawai cs ON pb.id_petugas_cs = cs.id_pegawai

                WHERE pg.id_pengiriman = ?`,
      [id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    const transaksi = result[0];

    // Ambil detail produk
    const [produk] = await pool.query(
      `SELECT b.nama_barang, b.harga_barang
      FROM barang b
      JOIN bridgebarangtransaksi bbt ON bbt.id_barang = b.id_barang
      WHERE bbt.id_transaksi = ?`,
      [transaksi.id_transaksi]
    );

    return NextResponse.json(
      { transaksi: { ...result[0], produk } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gagal ambil data nota:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}
