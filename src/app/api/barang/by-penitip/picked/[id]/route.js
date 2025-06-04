import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(request, context) {
    try {
        const { params } = context;
        const { id } = await params;

        const { status_titip } = await request.json();

        if (!status_titip || !id) {
            return NextResponse.json({ error: "Missing required fields!" }, { status: 400 });
        }

        const today = new Date().toISOString().split("T")[0];

        const [result] = await pool.query(
            `UPDATE barang SET tanggal_konfirmasi = ?, status_titip = ? WHERE id_barang = ?`,
            [today, status_titip, id]
        );

        return NextResponse.json({ message: "Pengajuan berhasil!", id_barang: id }, { status: 200 });
    } catch (error) {
        console.error("Error updating barang (Pengajuan):", error);
        return NextResponse.json({ error: "Gagal mengajukan pengembalian" }, { status: 500 });
    }
}
