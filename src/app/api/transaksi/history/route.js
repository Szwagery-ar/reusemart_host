import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        // Ambil token dari cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        // Cek jika token tidak ada
        if (!token) {
            return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
        }

        // Verifikasi token dan ambil informasi id_pembeli dari decoded token
        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;
        const role = decoded.role;

        // Pastikan user memiliki role 'pembeli'
        if (role !== "pembeli") {
            return NextResponse.json({ error: "Unauthorized - not a Pembeli" }, { status: 403 });
        }

        // Mulai query untuk mengambil transaksi dan pembayaran berdasarkan id_pembeli
        let query = `
            SELECT 
                t.id_transaksi, t.no_nota, t.harga_awal, t.ongkos_kirim, t.diskon, t.harga_akhir, 
                t.status_transaksi, t.tanggal_pesan, t.tanggal_lunas, p.status_pembayaran, 
                p.img_bukti_transfer, peg.nama AS petugas_name,
                b.kode_produk, b.nama_barang, b.harga_barang, b.berat_barang, b.status_garansi
            FROM transaksi t
            JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
            LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
            LEFT JOIN barang b ON t.id_transaksi = b.id_transaksi  -- Menggabungkan dengan tabel barang
            WHERE t.id_pembeli = ?
        `;
        let values = [id_pembeli];

        // Cek apakah ada parameter pencarian
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        if (search) {
            query += ` AND (t.no_nota LIKE ? OR peg.nama LIKE ? OR b.nama_barang LIKE ?)`;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Menambahkan urutan berdasarkan tanggal_pesan
        query += ` ORDER BY t.tanggal_pesan DESC`;

        // Menjalankan query untuk mengambil data transaksi, pembayaran, dan barang
        const [transaksi] = await pool.query(query, values);

        // Mengembalikan hasil transaksi
        return NextResponse.json({ transaksi }, { status: 200 });

    } catch (error) {
        console.error("Transaction History GET error:", error);
        return NextResponse.json({ error: "Failed to fetch Transaction History" }, { status: 500 });
    }
}
