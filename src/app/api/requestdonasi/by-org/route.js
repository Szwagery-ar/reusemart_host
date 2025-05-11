import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_org = decoded.id;

        const [rows] = await pool.query(
            `SELECT 
                rq.id_request, 
                rq.tanggal_request, 
                rq.deskripsi, 
                rq.status_request
            FROM requestdonasi rq
            JOIN organisasi o ON rq.id_organisasi = o.id_organisasi
            WHERE rq.id_organisasi = ?
            ORDER BY rq.tanggal_request DESC`,
            [id_org]
        );

        return NextResponse.json({ request: rows }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch RequestDonasi" }, { status: 500 });
    }
}
