import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        // Ambil token dari cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;
        const role = decoded.role;

        // Pastikan user memiliki role 'pembeli'
        if (role !== "pembeli") {
            return NextResponse.json({ error: "Unauthorized - not a Pembeli" }, { status: 403 });
        }

        // Ambil parameter id_transaksi dari URL
        const { searchParams } = new URL(request.url);
        const id_transaksi = searchParams.get("id_transaksi");

        if (!id_transaksi) {
            return NextResponse.json({ error: "id_transaksi is required" }, { status: 400 });
        }

        // Ambil data barang berdasarkan id_transaksi
        let query = `
        SELECT 
                b.kode_produk, 
                b.nama_barang, 
                b.harga_barang, 
                b.berat_barang, 
                b.tanggal_garansi, 
                gb.src_img
            FROM 
                bridgebarangtransaksi bt
            JOIN barang b ON bt.id_barang = b.id_barang
            LEFT JOIN (
                SELECT g1.id_barang, g1.src_img
                FROM gambarbarang g1
                INNER JOIN (
                    SELECT id_barang, MIN(id_gambar) AS min_id
                    FROM gambarbarang
                    GROUP BY id_barang
                ) g2 ON g1.id_barang = g2.id_barang AND g1.id_gambar = g2.min_id
            ) gb ON b.id_barang = gb.id_barang
            WHERE bt.id_transaksi = ?
        `;


        const [barang] = await pool.query(query, [id_transaksi]);

        return NextResponse.json({ barang }, { status: 200 });
    } catch (error) {
        console.error("Barang GET error:", error);
        return NextResponse.json({ error: "Failed to fetch Barang" }, { status: 500 });
    }
}
