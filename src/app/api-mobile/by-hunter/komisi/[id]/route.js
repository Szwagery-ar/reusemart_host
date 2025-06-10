import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
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

    const id_komisi = params.id;
    const role = decoded.role;

    if (role !== "hunter" && role !== "kurir" && role !== "admin") {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized role" }),
        { status: 403 }
      );
    }

    const [komisiRows] = await pool.query(
      `
      SELECT 
        k.*, 
        t.no_nota,
        t.harga_awal - IFNULL(t.diskon, 0) AS harga_jual,
        p.nama AS nama_penitip,
        h.nama AS nama_hunter
      FROM komisi k
      JOIN transaksi t ON k.id_transaksi = t.id_transaksi
      JOIN penitip p ON k.id_penitip = p.id_penitip
      LEFT JOIN pegawai h ON k.id_petugas_hunter = h.id_pegawai
      WHERE k.id_komisi = ?
      `,
      [id_komisi]
    );

    if (komisiRows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Data komisi tidak ditemukan",
        }),
        { status: 404 }
      );
    }

    const komisi = komisiRows[0];

    const [barangRows] = await pool.query(
      `
      SELECT 
        b.id_barang,
        b.nama_barang,
        b.kode_produk,
        b.harga_barang,
        b.status_titip,
        b.tanggal_masuk,
        b.tanggal_keluar,
        b.tanggal_garansi
      FROM bridgebarangtransaksi bt
      JOIN barang b ON bt.id_barang = b.id_barang
      WHERE bt.id_transaksi = ?
      `,
      [komisi.id_transaksi]
    );

    const barang = barangRows; 

    const idBarangs = barang.map((b) => b.id_barang);
    let gambarBarang = [];

    if (idBarangs.length > 0) {
      const placeholders = idBarangs.map(() => "?").join(", ");
      const [gambarRows] = await pool.query(
        `
        SELECT * FROM gambarbarang
        WHERE id_barang IN (${placeholders})
        `,
        idBarangs
      );
      gambarBarang = gambarRows;
    }

    console.log(gambarBarang);

    return new Response(
      JSON.stringify({
        success: true,
        komisi,
        barang,
        gambarBarang,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Detail komisi error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
