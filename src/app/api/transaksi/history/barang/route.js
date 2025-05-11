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
                b.status_garansi, 
                gb.src_img
            FROM 
                barang b
            LEFT JOIN 
                (SELECT DISTINCT id_barang, src_img
                FROM gambarbarang
                ORDER BY id_gambar ASC) gb 
                ON b.id_barang = gb.id_barang
            WHERE 
                b.id_transaksi = ?
        `;

        const [barang] = await pool.query(query, [id_transaksi]);

        return NextResponse.json({ barang }, { status: 200 });
    } catch (error) {
        console.error("Barang GET error:", error);
        return NextResponse.json({ error: "Failed to fetch Barang" }, { status: 500 });
    }
}
