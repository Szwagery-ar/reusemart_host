import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;
        const role = decoded.role;

        if (role !== "pembeli") {
            return NextResponse.json({ error: "Unauthorized - not a Pembeli" }, { status: 403 });
        }

        let query = `
            SELECT 
                t.id_transaksi, 
                t.no_nota, 
                t.harga_awal, 
                t.ongkos_kirim, 
                t.diskon, 
                t.harga_akhir, 
                t.status_transaksi, 
                t.tanggal_pesan, 
                t.tanggal_lunas,
                t.tambahan_poin,
                p.status_pembayaran, 
                p.img_bukti_transfer, 
                peg.nama AS petugas_name,
                peng.jenis_pengiriman, 
                peng.lokasi
            FROM transaksi t
            JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
            LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
            LEFT JOIN pengiriman peng ON t.id_transaksi = peng.id_transaksi
            WHERE t.id_pembeli = ? 
            AND t.status_transaksi = 'pending'
            ORDER BY t.tanggal_pesan DESC;
        `;

        const [transaksi] = await pool.query(query, [id_pembeli]);

        return NextResponse.json({ transaksi }, { status: 200 });
    } catch (error) {
        console.error("Transaction Pending GET error:", error);
        return NextResponse.json({ error: "Failed to fetch Transaction Pending" }, { status: 500 });
    }
}
