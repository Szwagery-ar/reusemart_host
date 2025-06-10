import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_, context) {
  try {
    const id = context.params.id;

    const [rows] = await pool.query(
      `SELECT id_merchandise, nama_merch, deskripsi_merch, jumlah_stok, jumlah_poin, src_img
       FROM merchandise
       WHERE id_merchandise = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Merchandise not found" }, { status: 404 });
    }

    return NextResponse.json({ merchandise: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/merchandise/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch merchandise detail" }, { status: 500 });
  }
}
