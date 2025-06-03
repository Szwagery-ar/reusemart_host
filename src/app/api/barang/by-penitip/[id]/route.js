import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { tanggal_expire, status_titip, is_extended } = await request.json();

        if (!id || !tanggal_expire || !status_titip) {
            return NextResponse.json({ error: "Missing required fields!" }, { status: 400 });
        }

        const [result] = await pool.query(
            `UPDATE barang SET tanggal_expire = ?, status_titip = ?, is_extended = ? WHERE id_barang = ?`,
            [tanggal_expire, status_titip, is_extended ?? 1, id]
        );

        return NextResponse.json({ message: "Perpanjangan berhasil!", id_barang: id }, { status: 200 });
    } catch (error) {
        console.error("Error updating barang (perpanjangan):", error);
        return NextResponse.json({ error: "Gagal memperpanjang barang" }, { status: 500 });
    }
}