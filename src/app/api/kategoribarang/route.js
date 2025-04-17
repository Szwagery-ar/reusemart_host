import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT id_kategori, nama_kategori
            FROM kategoribarang
        `;
        let values = [];

        if (search) {
            query += ` WHERE nama_kategori LIKE ?`;
            values = [`%${search}%`];
        }

        const [kategoriBarang] = await pool.query(query, values);

        return NextResponse.json({ kategoriBarang }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Kategori Barang" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama_kategori } = await request.json();

        if (!nama_kategori) {
            return NextResponse.json({ error: "nama_kategori is required!" }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO kategoribarang (nama_kategori) VALUES (?)",
            [nama_kategori]
        );

        return NextResponse.json({ message: "Kategori Barang added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add KategoriBarang" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_kategori, nama_kategori } = await request.json();

        if (!id_kategori || !nama_kategori) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [kategoriExists] = await pool.query("SELECT * FROM kategoribarang WHERE id_kategori = ?", [id_kategori]);

        if (kategoriExists.length === 0) {
            return NextResponse.json({ error: "Kategori Barang not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE kategoribarang SET nama_kategori = ? WHERE id_kategori = ?",
            [nama_kategori, id_kategori]
        );

        return NextResponse.json({ message: "Kategori Barang updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Kategori Barang" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_kategori } = await request.json();

        if (!id_kategori) {
            return NextResponse.json({ error: "id_kategori is required!" }, { status: 400 });
        }

        const [kategoriExists] = await pool.query("SELECT * FROM kategoribarang WHERE id_kategori = ?", [id_kategori]);

        if (kategoriExists.length === 0) {
            return NextResponse.json({ error: "Kategori Barang not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM kategoribarang WHERE id_kategori = ?", [id_kategori]);

        return NextResponse.json({ message: "Kategori Barang deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Kategori Barang" }, { status: 500 });
    }
}
