import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT nama
            FROM penitip
            WHERE badge_level = 'TOP SELLER'
            LIMIT 1
        `);

        if (rows.length === 0) {
            return NextResponse.json({ message: "Belum ada Top Seller bulan ini." }, { status: 404 });
        }

        return NextResponse.json({ nama: rows[0].nama }, { status: 200 });

    } catch (error) {
        console.error("Error fetching top seller name:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
