import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT b.id_barang, b.kode_produk, b.nama_barang, b.deskripsi_barang, b.harga_barang, b.status_titip, 
                   b.tanggal_masuk, b.tanggal_keluar, b.status_garansi, p.nama AS penitip_name
            FROM barang b
            LEFT JOIN penitip p ON b.id_penitip = p.id_penitip
        `;
        let values = [];

        if (search) {
            query += ` WHERE b.nama_barang LIKE ? OR b.kode_produk LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        }

        const [barang] = await pool.query(query, values);

        return NextResponse.json({ barang }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Barang" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { id_penitip, nama_barang, deskripsi_barang, berat_barang, harga_barang, status_garansi, status_titip, tanggal_masuk } = await request.json();

        if (!id_penitip || !nama_barang || !deskripsi_barang || !berat_barang || !harga_barang || !status_garansi || !status_titip || !tanggal_masuk) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const firstLetter = nama_barang.charAt(0).toUpperCase();
        const [lastBarang] = await pool.query("SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1");
        const nextId = lastBarang.length > 0 ? lastBarang[0].id_barang + 1 : 1; // Increment the last ID
        const kode_produk = firstLetter + nextId;

        await pool.query(
            "INSERT INTO barang (id_penitip, kode_produk, nama_barang, deskripsi_barang, berat_barang, harga_barang, status_garansi, status_titip, tanggal_masuk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_penitip, kode_produk, nama_barang, deskripsi_barang, berat_barang, harga_barang, status_garansi, status_titip, tanggal_masuk] // Urutan harus sesuai dengan kolom
        );

        return NextResponse.json({ message: "Barang added successfully!", nama_barang, kode_produk }, { status: 201 });

    } catch (error) {
        console.error("Error adding barang:", error);
        return NextResponse.json({ error: "Failed to add Barang" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_barang, deskripsi_barang, berat_barang, harga_barang, status_garansi, status_titip } = await request.json();

        // Validasi input
        if (!id_barang || !deskripsi_barang || !berat_barang || !harga_barang || !status_garansi || !status_titip ) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Update barang
        await pool.query(
            `UPDATE barang SET deskripsi_barang = ?, berat_barang = ?, harga_barang = ?, status_garansi = ?, status_titip = ? WHERE id_barang = ?`,
            [deskripsi_barang, berat_barang, harga_barang, status_garansi, status_titip, id_barang]
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
