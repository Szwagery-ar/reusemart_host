import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyUserRole } from '@/lib/auth';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';

export async function GET(request) {
    try {
        await verifyUserRole(["CS", "Superuser"]);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
        SELECT 
            p.id_penitip, 
            D.id_donasi,
            p.nama, 
            d.tanggal_donasi
        FROM penitip p 
        LEFT JOIN penitipanbarang pb ON p.id_penitip = pb.id_penitip
        LEFT JOIN barang b ON b.id_penitipan = pb.id_penitipan
        LEFT JOIN donasi d ON b.id_donasi = d.id_donasi 
        WHERE 
            b.id_donasi IS NOT NULL 
            AND d.status_donasi = 'DONE'
            AND DATEDIFF(NOW(), d.tanggal_donasi) < 30;
        `;

        let values = [];



        const [penitip] = await pool.query(query, values);

        return NextResponse.json({ penitip }, { status: 200 });

    } catch (error) {
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: "Anda tidak memiliki akses ke halaman ini" }, { status: 403 });
        }
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: "Token tidak valid atau telah kedaluwarsa" }, { status: 401 });
        }

        console.error("Uncaught error:", error); // hanya log error sistem
        return NextResponse.json({ error: "Gagal mengambil data penitip" }, { status: 500 });
    }

}