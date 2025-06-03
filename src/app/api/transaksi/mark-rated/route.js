import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request) {
    const { searchParams } = new URL(request.url);
    const id_transaksi = searchParams.get("id_transaksi");

    if (!id_transaksi) {
        return NextResponse.json({ message: "id_transaksi diperlukan" }, { status: 400 });
    }

    try {
        await pool.query(
            "UPDATE transaksi SET is_rated = 1 WHERE id_transaksi = ?",
            [id_transaksi]
        );
        return NextResponse.json({ message: "is_rated berhasil diupdate" });
    } catch (error) {
        console.error("❌ Gagal update is_rated:", error);
        return NextResponse.json({ message: "Gagal update is_rated" }, { status: 500 });
    }
}
