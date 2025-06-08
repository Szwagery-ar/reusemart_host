import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
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
                p.nama AS penitip_name,
                gb.id_gambar, 
                gb.src_img,
                kb.nama_kategori
            FROM barang b
            LEFT JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
            LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
            LEFT JOIN bridgekategoribarang bkb ON b.id_barang = bkb.id_barang
            LEFT JOIN kategoribarang kb ON bkb.id_kategori = kb.id_kategori
            WHERE b.status_titip IN ('AVAILABLE', 'EXTENDED')
        `;

        let values = [];

        if (search) {
            query += ` AND (b.nama_barang LIKE ? OR b.kode_produk LIKE ?)`;
            values.push(`%${search}%`, `%${search}%`);
        }

        const [barang] = await pool.query(query, values);

        const groupedBarang = barang.reduce((acc, item) => {
            if (!acc[item.id_barang]) {
                acc[item.id_barang] = {
                    ...item,
                    gambar_barang: [],
                    kategori_barang: []
                };
            }
            if (item.id_gambar) {
                acc[item.id_barang].gambar_barang.push({
                    id_gambar: item.id_gambar,
                    src_img: item.src_img,  
                });
            }
            if (item.nama_kategori) {
                acc[item.id_barang].kategori_barang.push(item.nama_kategori);
            }
            return acc;
        }, {});

        const result = Object.values(groupedBarang);

        return NextResponse.json({ barang: result }, { status: 200 });

    } catch (error) {
        console.error('Error fetching barang:', error);
        return NextResponse.json({ error: "Failed to fetch Barang" }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        const { id_penitip, nama_barang, deskripsi_barang, berat_barang, harga_barang, tanggal_garansi, status_titip, tanggal_masuk } = await request.json();

        if (!id_penitip || !nama_barang || !deskripsi_barang || !berat_barang || !harga_barang || !tanggal_garansi || !status_titip || !tanggal_masuk) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const firstLetter = nama_barang.charAt(0).toUpperCase();
        const [lastBarang] = await pool.query("SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1");
        const nextId = lastBarang.length > 0 ? lastBarang[0].id_barang + 1 : 1; // Increment the last ID
        const kode_produk = firstLetter + nextId;

        await pool.query(
            "INSERT INTO barang (id_penitip, kode_produk, nama_barang, deskripsi_barang, berat_barang, harga_barang, tanggal_garansi, status_titip, tanggal_masuk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_penitip, kode_produk, nama_barang, deskripsi_barang, berat_barang, harga_barang, tanggal_garansi, status_titip, tanggal_masuk] // Urutan harus sesuai dengan kolom
        );

        return NextResponse.json({ message: "Barang added successfully!", nama_barang, kode_produk }, { status: 201 });

    } catch (error) {
        console.error("Error adding barang:", error);
        return NextResponse.json({ error: "Failed to add Barang" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_barang, deskripsi_barang, berat_barang, harga_barang, tanggal_garansi, status_titip } = await request.json();

        if (!id_barang || !deskripsi_barang || !berat_barang || !harga_barang || !tanggal_garansi || !status_titip) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        await pool.query(
            `UPDATE barang SET deskripsi_barang = ?, berat_barang = ?, harga_barang = ?, tanggal_garansi = ?, status_titip = ? WHERE id_barang = ?`,
            [deskripsi_barang, berat_barang, harga_barang, tanggal_garansi, status_titip, id_barang]
        );

        return NextResponse.json({ message: "Barang updated successfully!", id_barang }, { status: 200 });

    } catch (error) {
        console.error("Error updating barang:", error);
        return NextResponse.json({ error: "Failed to update Barang" }, { status: 500 });
    }
}


export async function DELETE(request) {
    try {
        const { id_barang } = await request.json();

        if (!id_barang) {
            return NextResponse.json({ error: "id_barang is required!" }, { status: 400 });
        }

        const [barangExists] = await pool.query("SELECT * FROM barang WHERE id_barang = ?", [id_barang]);

        if (barangExists.length === 0) {
            return NextResponse.json({ error: "Barang not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM barang WHERE id_barang = ?", [id_barang]);

        return NextResponse.json({ message: "Barang deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Barang" }, { status: 500 });
    }
}

