import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request, { params }) {
  const { id } = params;
  const id_pengiriman = id;

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_petugas_kurir = decoded.id;

    const [result] = await pool.query(
      `SELECT
        pg.id_pengiriman, 
        pg.id_transaksi, 
        pg.tanggal_kirim,
        pg.tanggal_terima,
        pg.lokasi,
        pg.id_alamat,
        pg.status_pengiriman,
        a.note,
        pmb.nama AS nama_penerima
      FROM pengiriman pg
      JOIN transaksi t ON pg.id_transaksi = t.id_transaksi
      JOIN pembeli pmb ON t.id_pembeli = pmb.id_pembeli
      JOIN alamat a ON pg.id_alamat = a.id_alamat
      WHERE pg.id_petugas_kurir = ? AND pg.id_pengiriman = ?
     `,
      [id_petugas_kurir, id_pengiriman]
    );

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengiriman tidak ditemukan atau bukan milik Anda",
        },
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
