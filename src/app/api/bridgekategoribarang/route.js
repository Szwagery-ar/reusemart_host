import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT b.id_barang_kategori, b.id_barang, b.id_kategori, bb.nama_barang, kb.nama_kategori
            FROM bridgekategoribarang b
            LEFT JOIN barang bb ON b.id_barang = bb.id_barang
            LEFT JOIN kategoribarang kb ON b.id_kategori = kb.id_kategori
        `;
        let values = [];

        if (search) {
            query += ` WHERE bb.nama_barang LIKE ? OR kb.nama_kategori LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        }

        const [bridgeKategoriBarang] = await pool.query(query, values);

        return NextResponse.json({ bridgeKategoriBarang }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch BridgeKategoriBarang" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { id_barang, id_kategori } = await request.json();

        if (!id_barang || !id_kategori) {
            return NextResponse.json({ error: "id_barang and id_kategori are required!" }, { status: 400 });
        }

        const [existingRelation] = await pool.query(
            "SELECT * FROM bridgekategoribarang WHERE id_barang = ? AND id_kategori = ?",
            [id_barang, id_kategori]
        );

        if (existingRelation.length > 0) {
            return NextResponse.json({ error: "This relation already exists!" }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO bridgekategoribarang (id_barang, id_kategori) VALUES (?, ?)",
            [id_barang, id_kategori]
        );

        return NextResponse.json({ message: "Relation created successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to create BridgeKategoriBarang" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_barang_kategori, id_barang, id_kategori } = await request.json();

        if (!id_barang_kategori || !id_barang || !id_kategori) {
            return NextResponse.json({ error: "id_barang_kategori, id_barang, and id_kategori are required!" }, { status: 400 });
        }

        const [relationExists] = await pool.query("SELECT * FROM bridgekategoribarang WHERE id_barang_kategori = ?", [id_barang_kategori]);

        if (relationExists.length === 0) {
            return NextResponse.json({ error: "Relation not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE bridgekategoribarang SET id_barang = ?, id_kategori = ? WHERE id_barang_kategori = ?",
            [id_barang, id_kategori, id_barang_kategori]
        );

        return NextResponse.json({ message: "Relation updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update BridgeKategoriBarang" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_barang_kategori } = await request.json();

        if (!id_barang_kategori) {
            return NextResponse.json({ error: "id_barang_kategori is required!" }, { status: 400 });
        }

        const [relationExists] = await pool.query("SELECT * FROM bridgekategoribarang WHERE id_barang_kategori = ?", [id_barang_kategori]);

        if (relationExists.length === 0) {
            return NextResponse.json({ error: "Relation not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM bridgekategoribarang WHERE id_barang_kategori = ?", [id_barang_kategori]);

        return NextResponse.json({ message: "Relation deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete BridgeKategoriBarang" }, { status: 500 });
    }
}
