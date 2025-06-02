import pool from "@/lib/db"
import { NextResponse } from "next/server"


// /api/pegawai/qc/route.js
export async function GET() {
    try {
        const [qcList] = await pool.query(`
      SELECT id_pegawai, nama FROM pegawai WHERE id_jabatan = 5
    `);

        return NextResponse.json({ qc: qcList });
    } catch (error) {
        console.error("Failed to fetch QC list:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
