import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT alamat.id_alamat, alamat.nama_alamat, alamat.lokasi, alamat.id_pembeli, pembeli.nama AS nama_pembeli
            FROM alamat
            JOIN pembeli ON alamat.id_pembeli = pembeli.id_pembeli
        `;

        let values = [];

        if (search) {
            query += `
                WHERE alamat.nama_alamat LIKE ? 
                OR alamat.lokasi LIKE ? 
                OR pembeli.nama LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [alamat] = await pool.query(query, values);

        return NextResponse.json({ alamat }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Alamat" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama_alamat, lokasi, id_pembeli } = await request.json();

        if (!nama_alamat || !lokasi || !id_pembeli) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Check if Pembeli exists
        const [pembeliExists] = await pool.query("SELECT id_pembeli FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

        if (pembeliExists.length === 0) {
            return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
        }

        await pool.query(
            "INSERT INTO alamat (nama_alamat, lokasi, id_pembeli) VALUES (?, ?, ?)",
            [nama_alamat, lokasi, id_pembeli]
        );

        return NextResponse.json({ message: "Alamat added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add Alamat" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_alamat, nama_alamat, lokasi, id_pembeli } = await request.json();

        if (!id_alamat || !nama_alamat || !lokasi || !id_pembeli) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Check if Alamat exists
        const [alamatExists] = await pool.query("SELECT * FROM alamat WHERE id_alamat = ?", [id_alamat]);

        if (alamatExists.length === 0) {
            return NextResponse.json({ error: "Alamat not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE alamat SET nama_alamat = ?, lokasi = ?, id_pembeli = ? WHERE id_alamat = ?",
            [nama_alamat, lokasi, id_pembeli, id_alamat]
        );

        return NextResponse.json({ message: "Alamat updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Alamat" }, { status: 500 });
    }
}


export async function DELETE(request) {
    try {
        const { id_alamat } = await request.json();

        if (!id_alamat) {
            return NextResponse.json({ error: "id_alamat is required!" }, { status: 400 });
        }

        // Check if Alamat exists
        const [alamatExists] = await pool.query("SELECT * FROM alamat WHERE id_alamat = ?", [id_alamat]);

        if (alamatExists.length === 0) {
            return NextResponse.json({ error: "Alamat not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM alamat WHERE id_alamat = ?", [id_alamat]);

        return NextResponse.json({ message: "Alamat deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Alamat" }, { status: 500 });
    }
}
