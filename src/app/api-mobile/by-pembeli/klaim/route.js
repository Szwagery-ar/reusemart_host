import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Ambil token dari header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_pembeli = decoded.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
      SELECT 
        k.id_klaim, 
        k.id_merchandise, 
        m.nama_merch, 
        k.jml_merch_diklaim, 
        (m.jumlah_poin * k.jml_merch_diklaim) AS total_poin, 
        p.nama
      FROM klaim k
      JOIN merchandise m ON k.id_merchandise = m.id_merchandise
      JOIN pembeli p ON k.id_pembeli = p.id_pembeli
      WHERE k.id_pembeli = ?
    `;
    let values = [id_pembeli];

    // Jika ada pencarian, tambahkan kondisi pencarian
    if (search) {
      query += ` AND (p.nama LIKE ? OR m.nama_merch LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    const [klaim] = await pool.query(query, values);

    return NextResponse.json({ klaim }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch Klaim:", error);
    return NextResponse.json(
      { error: "Failed to fetch Klaim" },
      { status: 500 }
    );
  }
}
