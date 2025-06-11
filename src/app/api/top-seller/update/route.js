import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Reset semua badge_level ke 'novice'
        await connection.query(`UPDATE penitip SET badge_level = 'novice'`);

        // 2. Hitung jumlah barang terjual bulanan (per penitip) dan update ke kolom
        await connection.query(`
            UPDATE penitip p
            JOIN (
                SELECT pb.id_penitip, COUNT(b.id_barang) AS total_bulanan
                FROM barang b
                JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
                WHERE b.status_titip = 'SOLD'
                  AND MONTH(b.tanggal_keluar) = MONTH(CURRENT_DATE())
                  AND YEAR(b.tanggal_keluar) = YEAR(CURRENT_DATE())
                GROUP BY pb.id_penitip
            ) t ON p.id_penitip = t.id_penitip
            SET p.jml_barang_terjual_bulanan = t.total_bulanan
        `);

        // 3. Update TOP SELLER berdasarkan yang paling tinggi
        await connection.query(`
            UPDATE penitip
            SET badge_level = 'TOP SELLER'
            WHERE id_penitip = (
                SELECT pb.id_penitip
                FROM barang b
                JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
                WHERE b.status_titip = 'SOLD'
                  AND MONTH(b.tanggal_keluar) = MONTH(CURRENT_DATE())
                  AND YEAR(b.tanggal_keluar) = YEAR(CURRENT_DATE())
                GROUP BY pb.id_penitip
                ORDER BY COUNT(b.id_barang) DESC
                LIMIT 1
            )
        `);

        await connection.commit();

        return NextResponse.json({ success: true, message: "Top Seller updated!" }, { status: 200 });

    } catch (err) {
        await connection.rollback();
        console.error("Error updating Top Seller:", err);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    } finally {
        connection.release();
    }
}
