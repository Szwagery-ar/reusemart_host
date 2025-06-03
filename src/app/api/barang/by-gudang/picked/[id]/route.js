import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(request, context) {
    try {
        const { params } = context;
        const { id } = await params;

        const { status_titip } = await request.json();

        if (!id || !status_titip) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const [result] = await pool.query(
            `UPDATE barang SET status_titip = ? WHERE id_barang = ?`,
            [status_titip, id]
        );

        return NextResponse.json({ message: "Barang berhasil dikonfirmasi sebagai PICKED_UP." }, { status: 200 });
    } catch (error) {
        console.error("Error updating status_titip (admin):", error);
        return NextResponse.json({ error: "Gagal mengupdate status barang." }, { status: 500 });
    }
}
