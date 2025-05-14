import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit") || 8;

        const queryBarang = `
            SELECT 
                b.id_barang, 
                b.kode_produk, 
                b.nama_barang, 
                b.deskripsi_barang, 
                b.harga_barang, 
                b.status_titip, 
                b.tanggal_masuk, 
                b.tanggal_keluar, 
                b.tanggal_garansi, 
                p.nama AS penitip_name
            FROM barang b
            LEFT JOIN penitip p ON b.id_penitip = p.id_penitip
            ORDER BY b.tanggal_masuk DESC
            LIMIT ?
        `;

        const [barang] = await pool.query(queryBarang, [limit]);

        if (barang.length === 0) {
            return NextResponse.json({ message: "No items found" }, { status: 404 });
        }

        const queryGambar = `
            SELECT 
                gb.id_barang, 
                gb.id_gambar, 
                gb.src_img
            FROM gambarbarang gb
            WHERE gb.id_barang IN (${barang.map(item => item.id_barang).join(',')})
        `;

        const [gambar] = await pool.query(queryGambar);

        const groupedBarang = barang.map(item => {
            const gambarBarang = gambar.filter(img => img.id_barang === item.id_barang);
            return {
                ...item,
                gambar_barang: gambarBarang
            };
        });

        return NextResponse.json({ barang: groupedBarang }, { status: 200 });

    } catch (error) {
        console.error('Error fetching recent barang:', error);
        return NextResponse.json({ error: "Failed to fetch recent Barang" }, { status: 500 });
    }
}
