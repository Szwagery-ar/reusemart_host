import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = "SELECT * FROM jabatan";
        let values = [];

        if (search) {
            query += " WHERE nama_jabatan LIKE ?";
            values = [`%${search}%`];
        }

        const [jabatan] = await pool.query(query, values);

        return NextResponse.json({ jabatan }, { status: 200 });

    } catch (error) {
        console.error("Insert Error:", error);
        return NextResponse.json({ error: "Failed to fetch Jabatan" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama_jabatan } = await request.json();

        if (!nama_jabatan) {
            return NextResponse.json({ error: "Jabatan name is required!" }, { status: 400 });
        }

        const [existingJabatan] = await pool.query("SELECT * FROM jabatan WHERE nama_jabatan = ?", [nama_jabatan]);

        if (existingJabatan.length > 0) {
            return NextResponse.json({ error: "Jabatan name already exists! Please use a different name." }, { status: 400 });
        }

        await pool.query("INSERT INTO jabatan (nama_jabatan) VALUES (?)", [nama_jabatan]);

        return NextResponse.json({ message: "Jabatan added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add Jabatan" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_jabatan, nama_jabatan } = await request.json();

        if (!id_jabatan || !nama_jabatan) {
            return NextResponse.json({ error: "id_jabatan and nama_jabatan are required!" }, { status: 400 });
        }

        const [existingJabatan] = await pool.query("SELECT * FROM jabatan WHERE id_jabatan = ?", [id_jabatan]);

        if (existingJabatan.length === 0) {
            return NextResponse.json({ error: "Jabatan not found!" }, { status: 404 });
        }

        const [duplicateJabatan] = await pool.query("SELECT * FROM jabatan WHERE nama_jabatan = ? AND id_jabatan != ?", [nama_jabatan, id_jabatan]);

        if (duplicateJabatan.length > 0) {
            return NextResponse.json({ error: "Jabatan name already exists! Please use a different name." }, { status: 400 });
        }

        await pool.query("UPDATE jabatan SET nama_jabatan = ? WHERE id_jabatan = ?", [nama_jabatan, id_jabatan]);

        return NextResponse.json({ message: "Jabatan updated successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: "Failed to update Jabatan" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_jabatan } = await request.json();

        if (!id_jabatan) {
            return NextResponse.json({ error: "id_jabatan is required!" }, { status: 400 });
        }

        const [existingJabatan] = await pool.query("SELECT * FROM jabatan WHERE id_jabatan = ?", [id_jabatan]);

        if (existingJabatan.length === 0) {
            return NextResponse.json({ error: "Jabatan not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM jabatan WHERE id_jabatan = ?", [id_jabatan]);

        return NextResponse.json({ message: "Jabatan deleted successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete Jabatan" }, { status: 500 });
    }
}