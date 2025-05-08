import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_, {params}) {
    const { id_barang } = await params;

    try {
        const query = `
            SELECT 
                b.id_barang, b.kode_produk, b.nama_barang, b.deskripsi_barang,
                b.harga_barang, b.status_titip, b.tanggal_masuk, b.tanggal_keluar,
                b.status_garansi, b.berat_barang, p.nama AS penitip_name,
                gb.id_gambar, gb.src_img
            FROM barang b
            LEFT JOIN penitip p ON b.id_penitip = p.id_penitip
            LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
            WHERE b.id_barang = ?
        `;

        const [barang] = await pool.query(query, [id_barang]);

        if (barang.length === 0) {
            return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
        }

        const grouped = barang.reduce((acc, item) => {
            if (!acc) {
                acc = {
                    ...item,
                    gambar_barang: [],
                };
            }
            if (item.id_gambar) {
                acc.gambar_barang.push({
                    id_gambar: item.id_gambar,
                    src_img: item.src_img,
                });
            }
            return acc;
        }, null);

        return NextResponse.json({ barang: grouped }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
