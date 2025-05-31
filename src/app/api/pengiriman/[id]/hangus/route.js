import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
    const { id } = params;

    try {
        const [rows] = await pool.query(`
            SELECT t.*, p.id_barang 
            FROM transaksi t
            JOIN bridgebarangcart bbc ON t.id_transaksi = bbc.id_transaksi
            JOIN barang p ON bbc.id_barang = p.id_barang
            WHERE t.id_transaksi = ?
            LIMIT 1
    `, [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
        }

        const transaksi = rows[0];
        const tanggalLunas = new Date(transaksi.tanggal_lunas);
        const now = new Date();
        const selisihHari = Math.floor((now - tanggalLunas) / (1000 * 60 * 60 * 24));

        if (
            transaksi.jenis_pengiriman === "SELF_PICKUP" &&
            !transaksi.tanggal_terima &&
            transaksi.status === "CONFIRMED" &&
            selisihHari > 2
        ) {
            // Update status transaksi
            await pool.query(
                `UPDATE transaksi SET status_transaksi = 'CANCELLED' WHERE id_transaksi = ?`,
                [id]
            );

            // Tandai barang sebagai DONATEABLE
            await pool.query(
                `UPDATE barang SET status_titip = 'DONATEABLE' WHERE id_transaksi = ?`,
                [id]
            );

            return NextResponse.json({
                message: "Transaksi dibatalkan dan barang ditandai sebagai DONATEABLE"
            }, { status: 200 });
        } else {
            return NextResponse.json({
                error: "Tidak memenuhi syarat untuk dibatalkan (mungkin belum lewat 2 hari atau sudah diambil)"
            }, { status: 400 });
        }
    } catch (error) {
        console.error("Gagal membatalkan transaksi:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
