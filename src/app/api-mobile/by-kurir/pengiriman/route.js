import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request) {
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
    const role = decoded.role;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const onlyToday = searchParams.get("today") === "true";

    if (role !== "kurir") {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized role" }),
        { status: 403 }
      );
    }

    let query = `
      SELECT
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
      WHERE pg.id_petugas_kurir = ?
    `;

    const values = [id_petugas_kurir];

    if (onlyToday) {
      query += ` AND DATE(pg.tanggal_kirim) = CURRENT_DATE()`;
    }

    if (search) {
      query += `
      AND (
        nama_penerima LIKE ? OR
        a.note LIKE ? OR
        pg.lokasi LIKE ?
      )
    `;
      const searchPattern = `%${search}%`;
      values.push(searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY pg.tanggal_kirim DESC";

    const [pengiriman] = await pool.query(query, values);

    return new Response(JSON.stringify({ success: true, pengiriman }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pengiriman GET error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
