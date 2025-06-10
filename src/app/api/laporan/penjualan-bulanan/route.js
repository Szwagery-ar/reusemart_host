import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT 
        MONTHNAME(t.tanggal_lunas) AS bulan,
        COUNT(bt.id_barang) AS jumlah_terjual,
        SUM(t.harga_akhir) AS jumlah_penjualan
      FROM transaksi t
      JOIN bridgebarangtransaksi bt ON t.id_transaksi = bt.id_transaksi
      WHERE t.status_transaksi = 'PAID'
      GROUP BY MONTH(t.tanggal_lunas)
      ORDER BY MONTH(t.tanggal_lunas)
    `);

        const chart = rows.map(row => ({
            name: row.bulan,
            value: row.jumlah_penjualan,
        }));

        const table = rows.map(row => [
            row.bulan,
            row.jumlah_terjual,
            row.jumlah_penjualan,
        ]);

        return NextResponse.json({
            success: true,
            chart,
            table,
        });
    } catch (error) {
        console.error("Error fetching penjualan bulanan:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
