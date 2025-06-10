import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized - Token tidak ditemukan",
      }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const id_hunter = decoded.id;

    let query = `
      SELECT 
          k.id_komisi,
          t.no_nota,
          t.harga_awal - IFNULL(t.diskon, 0) AS harga_jual,
          k.komisi_reusemart,
          p.nama AS nama_penitip,
          k.komisi_penitip,
          h.nama AS nama_hunter,
          k.komisi_hunter
      FROM komisi k
      JOIN transaksi t ON k.id_transaksi = t.id_transaksi
      JOIN penitip p ON k.id_penitip = p.id_penitip
      LEFT JOIN pegawai h ON k.id_petugas_hunter = h.id_pegawai
      WHERE k.id_petugas_hunter = ?
    `;

    const values = [id_hunter];

    if (search) {
      query += `
        AND (
          t.no_nota LIKE ?
          OR p.nama LIKE ?
          OR h.nama LIKE ?
        )
      `;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [komisi] = await pool.query(query, values);

    return new Response(JSON.stringify({
      success: true,
      komisi,
    }), { status: 200 });

  } catch (error) {
    console.error("GET /api/komisi error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to fetch Komisi",
    }), { status: 500 });
  }
}