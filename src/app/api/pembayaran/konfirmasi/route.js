import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
      SELECT p.id_pembayaran, p.status_pembayaran, p.img_bukti_transfer,
        t.no_nota, peg.nama AS petugas_name
      FROM pembayaran p
      JOIN transaksi t ON p.id_transaksi = t.id_transaksi
      LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
    `;
    let values = [];

    if (search) {
      query += ` WHERE t.no_nota LIKE ? OR peg.nama LIKE ?`;
      values = [`%${search}%`, `%${search}%`];
    }

    query += ` ORDER BY FIELD(p.status_pembayaran, 'PENDING') DESC, p.id_pembayaran DESC`;

    const [pembayaran] = await pool.query(query, values);

    return NextResponse.json({ pembayaran }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pembayaran" },
      { status: 500 }
    );
  }
}
