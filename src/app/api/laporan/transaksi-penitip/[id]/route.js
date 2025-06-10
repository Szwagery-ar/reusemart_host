import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
    const id_penitip = params.id_penitip;

    try {
        const [rows] = await pool.query(`
            SELECT 
                b.id_barang,
                b.kode_produk,
                p.id_penitip,
                p.id AS id_penitip_internal,
                p.nama AS nama_penitip,
                MONTHNAME(t.tanggal_lunas) AS bulan,
                YEAR(t.tanggal_lunas) AS tahun,
                b.nama_barang,
                b.tanggal_masuk,
                t.tanggal_lunas AS tanggal_laku,
                t.harga_akhir,
                k.komisi_reusemart,
                k.komisi_penitip,
                k.komisi_hunter
            FROM barang b
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            JOIN penitip p ON pb.id_penitip = p.id_penitip
            JOIN bridgebarangtransaksi bt ON b.id_barang = bt.id_barang
            JOIN transaksi t ON bt.id_transaksi = t.id_transaksi
            JOIN komisi k ON k.id_transaksi = t.id_transaksi AND k.id_penitip = p.id_penitip
            AND p.id_penitip = ?
            ORDER BY t.tanggal_lunas ASC
        `, [id_penitip]);

        if (rows.length === 0) {
            return NextResponse.json({
                success: true,
                id_penitip,
                nama_penitip: "(Tidak ditemukan)",
                bulan: "-",
                tahun: "-",
                items: []
            });
        }

        const { nama_penitip, bulan, tahun } = rows[0];

        const items = rows.map(row => {
            const harga_jual_bersih = Number(row.harga_akhir || 0) - Number(row.komisi_reusemart || 0);
            const pendapatan = harga_jual_bersih + Number(row.komisi_penitip || 0);

            return {
                id_barang: row.id_barang,
                kode_produk: row.kode_produk,
                nama_barang: row.nama_barang,
                tanggal_masuk: row.tanggal_masuk,
                tanggal_laku: row.tanggal_laku,
                harga_jual_bersih,
                bonus_terjual_cepat: Number(row.komisi_penitip || 0),
                pendapatan
            };
        });

        return NextResponse.json({
            success: true,
            id_penitip: rows[0].id_penitip_internal,
            nama_penitip,
            bulan,
            tahun,
            items
        });

    } catch (error) {
        console.error("Error fetching transaksi penitip:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
