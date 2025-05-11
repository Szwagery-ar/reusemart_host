import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_penitip = decoded.id;

    const [rows] = await pool.query(
      `SELECT 
        t.id_transaksi,
        t.no_nota,
        t.tanggal_pesan,
        b.nama_barang,
        p.nama AS nama_pembeli,
        t.status_transaksi,
        SUM(b.harga_barang) AS total_harga,
        k.komisi_penitip
      FROM transaksi t
      JOIN barang b ON b.id_transaksi = t.id_transaksi
      JOIN pembeli p ON t.id_pembeli = p.id_pembeli
      JOIN komisi k ON t.id_transaksi = k.id_transaksi
      WHERE b.id_penitip = ?
      GROUP BY t.id_transaksi, t.no_nota, t.tanggal_pesan, b.nama_barang, t.status_transaksi, p.nama
      ORDER BY t.tanggal_pesan DESC`,
      [id_penitip]
    );

    return NextResponse.json({ transaksi: rows }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/transaksi/by-penitip:", error);
    return NextResponse.json({ error: "Failed to fetch Penitip's Transaksi" }, { status: 500 });
  }
}