import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
    try {
        const { id_penitipan } = params;

        const [transaksiRows] = await pool.query(
            `SELECT * FROM penitipanbarang WHERE id_penitipan = ?`,
            [id_penitipan]
        );

        if (transaksiRows.length === 0) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
        }

        const transaksi = transaksiRows[0];

        // Ambil barang-barang dalam transaksi ini
        const [barangRows] = await pool.query(
            `SELECT 
                b.*, 
                p.nama AS penitip_name,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id_gambar', g.id_gambar,
                        'src_img', g.src_img
                    )
                ) AS gambar_barang
            FROM barang b
            LEFT JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
            LEFT JOIN gambarbarang g ON b.id_barang = g.id_barang
            WHERE b.id_penitipan = ?
            GROUP BY b.id_barang`,
            [id_penitipan]
        );

        const barang = barangRows.map(row => ({
            ...row,
            gambar_barang: row.gambar_barang
                ? JSON.parse(`[${row.gambar_barang}]`)
                : [],
        }));

        return NextResponse.json({ transaksi: { ...transaksi, barang } }, { status: 200 });
    } catch (error) {
        console.error("GET /api/transaksi-penitipan/[id_penitipan] error:", error);
        return NextResponse.json({ error: "Gagal mengambil detail transaksi." }, { status: 500 });
    }
}
