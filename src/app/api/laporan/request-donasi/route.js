import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        o.id_organisasi,
        o.nama,
        o.alamat,
        r.deskripsi AS request
      FROM requestdonasi r
      JOIN organisasi o ON r.id_organisasi = o.id_organisasi
    `);

        const data = rows.map(row => ({
            id_organisasi: row.id_organisasi,
            nama: row.nama,
            alamat: row.alamat,
            request: row.request
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching request donasi:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
