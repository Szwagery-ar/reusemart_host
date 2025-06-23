import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized - no token" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_penitip = decoded.id;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let baseQuery = `
        SELECT 
            b.id_barang, b.kode_produk, b.nama_barang, b.deskripsi_barang,
            b.harga_barang, b.status_titip, b.tanggal_masuk, b.tanggal_keluar, b.tanggal_expire,
            b.tanggal_garansi, p.nama AS penitip_name, p.komisi AS komisi_penitip,
            gb.id_gambar, gb.src_img
        FROM barang b
        LEFT JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
        LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
        LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
        WHERE p.id_penitip = ? AND b.status_titip = 'EXTENDED'
        `;

        let values = [id_penitip];

        if (search) {
            baseQuery += ` AND (b.nama_barang LIKE ? OR b.kode_produk LIKE ?)`;
            values.push(`%${search}%`, `%${search}%`);
        }

        baseQuery += ` ORDER BY b.tanggal_masuk DESC`;

        const [barang] = await pool.query(baseQuery, values);

        // Gabungkan gambar
        const groupedBarang = barang.reduce((acc, item) => {
            if (!acc[item.id_barang]) {
                acc[item.id_barang] = {
                    ...item,
                    gambar_barang: [],
                };
            }
            if (item.id_gambar) {
                acc[item.id_barang].gambar_barang.push({
                    id_gambar: item.id_gambar,
                    src_img: item.src_img,
                });
            }
            return acc;
        }, {});

        const result = Object.values(groupedBarang);

        return NextResponse.json({ barang: result }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/barang/by-penitip:", error);
        return NextResponse.json(
            { error: "Failed to fetch Penitip's Barang" },
            { status: 500 }
        );
    }
}

// export async function POST(request) {
//     try {
        
//     } catch (){

//     }
// }