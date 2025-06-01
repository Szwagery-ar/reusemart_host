import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 200 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_penitip = decoded.id;

    const [barang] = await pool.query(
      `SELECT 
        b.id_barang, 
        b.kode_produk, 
        b.nama_barang, 
        b.deskripsi_barang, 
        b.harga_barang, 
        b.status_titip, 
        b.tanggal_masuk, 
        b.tanggal_keluar, 
        b.tanggal_garansi, 
        p.nama AS penitip_name,
        gb.id_gambar, 
        gb.src_img
      FROM barang b
      LEFT JOIN penitip p ON b.id_penitip = p.id_penitip
      LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
      WHERE b.id_penitip = ?
      ORDER BY b.tanggal_masuk DESC`,
      [id_penitip]
    );

    // Gabungkan gambar
    const groupedBarang = barang.reduce((acc, item) => {
      if (!acc[item.id_barang]) {
        acc[item.id_barang] = {
          ...item,
          gambar_barang: [],
        };
      }
      if (item.id_gambar) {
        acc[item.id_barang].gambar_barang.push({
          id_gambar: item.id_gambar,
          src_img: item.src_img,
        });
      }
      return acc;
    }, {});

    const result = Object.values(groupedBarang);

    return NextResponse.json({ barang: result }, { status: 200 });

  } catch (error) {
    console.error("Error in /api-penitip/barang/by-penitip:", error);
    return NextResponse.json({ error: "Failed to fetch Penitip's Barang" }, { status: 500 });
  }
}