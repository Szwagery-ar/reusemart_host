import { NextResponse } from "next/server";
import pool from "@/lib/db";


export async function PATCH(request, context) {
    const { id_barang } = context.params;

    const { rating } = await request.json();

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        return Response.json({ message: "Rating tidak valid" }, { status: 400 });
    }

    try {
        await pool.query(
            "UPDATE barang SET rating = ? WHERE id_barang = ?",
            [rating, id_barang]
        );

        const [barangRows] = await pool.query(
            "SELECT id_penitip FROM barang WHERE id_barang = ?",
            [id_barang]
        );

        if (!barangRows.length || !barangRows[0].id_penitip) {
            return Response.json({ message: "Penitip tidak ditemukan untuk barang ini" }, { status: 404 });
        }

        const id_penitip = barangRows[0].id_penitip;

        await pool.query(
            `UPDATE penitip 
            SET total_rating = total_rating + ?,
            jml_barang_terjual = jml_barang_terjual + 1,
            jml_barang_terjual_bulanan = jml_barang_terjual_bulanan + 1 
            WHERE id_penitip = ?`,
            [rating, id_penitip]
        );

        await pool.query(
            "UPDATE transaksi SET is_rated = 1 WHERE id_transaksi = (SELECT id_transaksi FROM bridgebarangtransaksi WHERE id_barang = ? LIMIT 1)",
            [id_barang]
        );

        return Response.json({ message: "Rating barang dan penitip berhasil disimpan" });
    } catch (error) {
        console.error("❌ Gagal update rating:", error);
        return Response.json({ message: "Gagal update rating" }, { status: 500 });
    }
}



