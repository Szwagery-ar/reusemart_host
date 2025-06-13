import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.kode_produk,
        b.nama_barang,
        p.id_penitip,
        p.nama AS nama_penitip,
        d.tanggal_donasi,
        o.nama AS nama_organisasi,
        d.nama_penerima
      FROM donasi d
      JOIN barang b ON b.id_donasi = d.id_donasi
      JOIN requestdonasi rq ON d.id_request = rq.id_request
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      JOIN penitip p ON pb.id_penitip = p.id_penitip
      JOIN organisasi o ON rq.id_organisasi = o.id_organisasi
      ORDER BY d.tanggal_donasi DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching barang donasi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data donasi." },
      { status: 500 }
    );
  }
}