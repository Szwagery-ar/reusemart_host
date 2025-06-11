import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    const [result] = await pool.query(`
    SELECT 
      b.kode_produk,
      b.nama_barang,
      pt.nama AS nama_penitip,
      b.tanggal_masuk,
      b.tanggal_expire,
      b.status_titip AS status
    FROM barang b
    JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
    JOIN penitip pt ON pb.id_penitip = pt.id_penitip
    WHERE b.status_titip = 'EXPIRED'
  `);

    return NextResponse.json(result);
}
