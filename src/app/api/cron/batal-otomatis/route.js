import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
    try {
        const [expired] = await pool.query(`
            SELECT p.id_transaksi
            FROM pembayaran p
            JOIN transaksi t ON t.id_transaksi = p.id_transaksi
            WHERE p.status_pembayaran = 'PENDING'
            AND p.deadline < NOW()
            AND t.status_transaksi = 'PENDING'
        `);

        for (const row of expired) {
            const id = row.id_transaksi;
            await fetch(`${process.env.BASE_URL}/api/transaksi/${id}/batal`, {
                method: "PATCH"
            });
        }

        return NextResponse.json({ message: `${expired.length} transaksi dibatalkan otomatis.` });
    } catch (error) {
        console.error("Gagal auto cancel by cron:", error);
        return NextResponse.json({ error: "Gagal membatalkan transaksi otomatis." }, { status: 500 });
    }
} 