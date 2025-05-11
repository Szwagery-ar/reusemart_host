import  pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {

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
                k.id_klaim,
                m.nama_merch,
                k.jml_merch_diklaim,
                k.total_poin,
                m.src_img
            FROM klaim k
            JOIN merchandise m ON k.id_merchandise = m.id_merchandise
            WHERE k.id_pembeli = ?
        `;

        const [klaim] = await pool.query(query, [id_pembeli]);

        return NextResponse.json({ klaim }, { status: 200 });

    } catch (error) {
        console.error("Error get klaim merch:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
