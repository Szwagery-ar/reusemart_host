import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                b.id_barang,
                b.kode_produk,
                b.nama_barang,
                b.status_titip,
                b.tanggal_konfirmasi,
                p.nama AS nama_penitip
            FROM barang b
            JOIN penitip p ON b.id_penitip = p.id_penitip
            WHERE b.status_titip = 'READY_PICK_UP'
        `);

        return NextResponse.json({ barang: rows }, { status: 200 });
    } catch (error) {
        console.error("Error fetching barang READY_PICK_UP:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}
