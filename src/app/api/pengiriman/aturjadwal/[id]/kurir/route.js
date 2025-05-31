import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [kurirRows] = await pool.query(`
            SELECT id_pegawai, nama
            FROM pegawai
            join jabatan jp on pegawai.id_jabatan = jp.id_jabatan
            WHERE nama_jabatan = 'Kurir'
        `);

        const [busyRows] = await pool.query(`
            SELECT DISTINCT id_petugas_kurir
            FROM pengiriman
            WHERE status_pengiriman != 'DONE' AND id_petugas_kurir IS NOT NULL
        `);

        const busyKurirIds = busyRows.map(row => row.id_petugas_kurir);

        const kurirWithStatus = kurirRows.map(kurir => ({
            ...kurir,
            status: busyKurirIds.includes(kurir.id_pegawai) ? "sibuk" : "siap"
        }));

        return NextResponse.json({ kurir: kurirWithStatus });
    } catch (err) {
        console.error("GET /api/pengiriman/aturjadwal/[id]/kurir error:", err);
        return NextResponse.json({ error: "Gagal mengambil data kurir" }, { status: 500 });
    }
}
