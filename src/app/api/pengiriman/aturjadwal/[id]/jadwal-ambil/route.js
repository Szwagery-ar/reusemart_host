// File: app/api/pengiriman/[id]/jadwal-ambil/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
    const { id } = params;
    const { tanggal_kirim } = await request.json();

    try {
        const [res] = await pool.query(
            `UPDATE pengiriman SET tanggal_kirim = ?, status_pengiriman = 'PICKED_UP' WHERE id_pengiriman = ?`,
            [tanggal_kirim, id]
        );

        if (res.affectedRows === 0) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ message: "Jadwal ambil berhasil disimpan" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal menyimpan jadwal ambil" }, { status: 500 });
    }
}
