import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT id_gambar, id_barang, src_img
            FROM gambarbarang
        `;
        let values = [];

        if (search) {
            query += ` WHERE src_img LIKE ?`;
            values = [`%${search}%`];
        }

        const [gambarBarang] = await pool.query(query, values);

        return NextResponse.json({ gambarBarang }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Gambar Barang" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { id_barang, src_img } = await request.json();

        if (!id_barang || !src_img) {
            return NextResponse.json({ error: "id_barang and src_img are required!" }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO gambarbarang (id_barang, src_img) VALUES (?, ?)",
            [id_barang, src_img]
        );

        return NextResponse.json({ message: "Gambar Barang added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add Gambar Barang" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_gambar_barang, id_barang, src_img } = await request.json();

        if (!id_gambar_barang || !id_barang || !src_img) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [gambarBarangExists] = await pool.query("SELECT * FROM gambarbarang WHERE id_gambar_barang = ?", [id_gambar_barang]);

        if (gambarBarangExists.length === 0) {
            return NextResponse.json({ error: "Gambar Barang not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE gambarbarang SET id_barang = ?, src_img = ? WHERE id_gambar_barang = ?",
            [id_barang, src_img, id_gambar_barang]
        );

        return NextResponse.json({ message: "Gambar Barang updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Gambar Barang" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_gambar_barang } = await request.json();

        if (!id_gambar_barang) {
            return NextResponse.json({ error: "id_gambar_barang is required!" }, { status: 400 });
        }

        const [gambarBarangExists] = await pool.query("SELECT * FROM gambarbarang WHERE id_gambar_barang = ?", [id_gambar_barang]);

        if (gambarBarangExists.length === 0) {
            return NextResponse.json({ error: "Gambar Barang not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM gambarbarang WHERE id_gambar_barang = ?", [id_gambar_barang]);

        return NextResponse.json({ message: "Gambar Barang deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Gambar Barang" }, { status: 500 });
    }
}