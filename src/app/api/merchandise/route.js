import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `SELECT id_merchandise, nama_merch, deskripsi_merch, jumlah_stok FROM merchandise`;

        let values = [];

        if (search) {
            query += ` WHERE nama_merch LIKE ?`;
            values = [`%${search}%`];
        }

        const [merchandise] = await pool.query(query, values);

        return NextResponse.json({ merchandise }, { status: 200 });

    } catch (error) {
        console.error("GET Merchandise Error:", error);
        return NextResponse.json({ error: "Failed to fetch Merchandise", details: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama_merch, deskripsi_merch, jumlah_stok } = await request.json();

        if (!nama_merch || !deskripsi_merch || jumlah_stok === undefined) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO merchandise (nama_merch, deskripsi_merch, jumlah_stok) VALUES (?, ?, ?)",
            [nama_merch, deskripsi_merch, jumlah_stok]
        );

        return NextResponse.json({ message: "Merchandise added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add Merchandise" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_merchandise, nama_merch, deskripsi_merch, jumlah_stok } = await request.json();

        if (!id_merchandise || !nama_merch || !deskripsi_merch || jumlah_stok === undefined) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [merchExists] = await pool.query("SELECT * FROM merchandise WHERE id_merchandise = ?", [id_merchandise]);

        if (merchExists.length === 0) {
            return NextResponse.json({ error: "Merchandise not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE merchandise SET nama_merch = ?, deskripsi_merch = ?, jumlah_stok = ? WHERE id_merchandise = ?",
            [nama_merch, deskripsi_merch, jumlah_stok, id_merchandise]
        );

        return NextResponse.json({ message: "Merchandise updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Merchandise" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_merchandise } = await request.json();

        if (!id_merchandise) {
            return NextResponse.json({ error: "id_merchandise is required!" }, { status: 400 });
        }

        const [merchExists] = await pool.query("SELECT * FROM merchandise WHERE id_merchandise = ?", [id_merchandise]);

        if (merchExists.length === 0) {
            return NextResponse.json({ error: "Merchandise not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM merchandise WHERE id_merchandise = ?", [id_merchandise]);

        return NextResponse.json({ message: "Merchandise deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Merchandise" }, { status: 500 });
    }
}
