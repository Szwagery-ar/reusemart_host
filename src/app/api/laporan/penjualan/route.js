import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    const [result] = await pool.query(`
    SELECT 
        k.nama_kategori AS kategori, 
        COUNT(b.id_barang) AS total_terjual, 
        SUM(b.harga_barang) AS total_penjualan
        FROM barang b
        JOIN bridgekategoribarang bk ON b.id_barang = bk.id_barang
        JOIN kategoribarang k ON bk.id_kategori = k.id_kategori
        WHERE b.status_titip = 'SOLD'
        GROUP BY k.id_kategori, k.nama_kategori;
    `);

    return NextResponse.json(result);
}
