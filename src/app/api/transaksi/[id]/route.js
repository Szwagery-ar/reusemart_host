import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  const id_transaksi = params.id;

  try {
    // Ambil detail transaksi + nama pembeli
    const [tx] = await pool.query(
      `SELECT t.*, p.nama AS nama_pembeli
       FROM transaksi t
       JOIN pembeli p ON t.id_pembeli = p.id_pembeli
       WHERE t.id_transaksi = ?`,
      [id_transaksi]
    );

    if (!tx || tx.length === 0) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // Ambil barang + gambar utama (gambar pertama per barang)
    const [barang] = await pool.query(
      `SELECT 
          b.id_barang, 
          b.nama_barang, 
          b.harga_barang,
          (SELECT src_img FROM gambarbarang g WHERE g.id_barang = b.id_barang LIMIT 1) AS src_img
       FROM barang b
       WHERE b.id_transaksi = ?`,
      [id_transaksi]
    );

    return NextResponse.json({
      transaksi: tx[0],
      barang,
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/transaksi/:id error:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi." }, { status: 500 });
  }
}
