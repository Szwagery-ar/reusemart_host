import pool from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_transaksi = searchParams.get("id_transaksi");

        if (!id_transaksi) {
            return NextResponse.json({ error: "id_transaksi is required" }, { status: 400 });
        }

        const query = `
            SELECT 
                b.id_barang,
                b.kode_produk, 
                b.nama_barang, 
                b.harga_barang, 
                b.berat_barang, 
                b.tanggal_garansi,
                g.src_img
            FROM barang b
            LEFT JOIN gambarbarang g ON b.id_barang = g.id_barang
            WHERE b.id_transaksi = ?
        `;

        const [rows] = await pool.query(query, [id_transaksi]);

        // Grouping gambar per barang
        const grouped = {};
        for (const row of rows) {
            if (!grouped[row.id_barang]) {
                grouped[row.id_barang] = {
                    id_barang: row.id_barang,
                    kode_produk: row.kode_produk,
                    nama_barang: row.nama_barang,
                    harga_barang: row.harga_barang,
                    berat_barang: row.berat_barang,
                    tanggal_garansi: row.tanggal_garansi,
                    images: [],
                };
            }
            if (row.src_img) {
                grouped[row.id_barang].images.push(row.src_img);
            }
        }

        const barang = Object.values(grouped);

        return NextResponse.json({ barang }, { status: 200 });
    } catch (error) {
        console.error("Barang GET error:", error);
        return NextResponse.json({ error: "Failed to fetch Barang" }, { status: 500 });
    }
}