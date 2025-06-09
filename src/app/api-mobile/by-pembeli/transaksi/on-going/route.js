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
    const id_pembeli = decoded.id;
    const role = decoded.role;

    if (role !== "pembeli") {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized role" }),
        { status: 403 }
      );
    }

    const query = `
      SELECT 
        t.id_transaksi, t.no_nota, t.harga_awal, t.ongkos_kirim, t.diskon,
        t.harga_akhir, t.status_transaksi, t.tanggal_pesan, t.tanggal_lunas,
        t.tambahan_poin, p.status_pembayaran, p.img_bukti_transfer, t.is_rated,
        peg.nama AS petugas_name, peng.jenis_pengiriman, peng.tanggal_kirim,
        peng.tanggal_terima, peng.lokasi
      FROM transaksi t
      JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
      LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
      LEFT JOIN pengiriman peng ON t.id_transaksi = peng.id_transaksi
      WHERE t.id_pembeli = ? AND t.status_transaksi != 'pending'
      ORDER BY t.tanggal_pesan DESC
    `;

    const [transaksi] = await pool.query(query, [id_pembeli]);

    return new Response(JSON.stringify({ success: true, transaksi }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
