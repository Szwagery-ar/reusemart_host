import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT donasi.id_donasi, donasi.status_donasi, donasi.tanggal_acc, donasi.tanggal_donasi, 
                   donasi.nama_penerima, donasi.id_request, requestdonasi.deskripsi
            FROM donasi
            JOIN requestdonasi ON donasi.id_request = requestdonasi.id_request
        `;

        let values = [];

        if (search) {
            query += `
                WHERE donasi.nama_penerima LIKE ? 
                OR donasi.status_donasi LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`];
        }

        const [donasi] = await pool.query(query, values);

        return NextResponse.json({ donasi }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Donasi" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_request } = await request.json();

        if (!status_donasi || !nama_penerima || !id_request) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [requestExists] = await pool.query(
            "SELECT id_request FROM requestdonasi WHERE id_request = ?",
            [id_request]
        );

        if (requestExists.length === 0) {
            return NextResponse.json({ error: "RequestDonasi not found!" }, { status: 404 });
        }

        const [donasiExists] = await pool.query(
            "SELECT id_donasi FROM donasi WHERE id_request = ?",
            [id_request]
        );

        if (donasiExists.length > 0) {
            return NextResponse.json({ error: "id_request already used in Donasi. Please use another one." }, { status: 409 });
        }

        await pool.query(
            "INSERT INTO donasi (status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_request) VALUES (?, ?, ?, ?, ?)",
            [status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_request]
        );

        return NextResponse.json({ message: "Donasi added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message || "Failed to add Donasi" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_donasi, status_donasi, tanggal_acc, tanggal_donasi, nama_penerima } = await request.json();

        if (!id_donasi || !status_donasi || !nama_penerima) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Check if Donasi exists
        const [donasiExists] = await pool.query("SELECT * FROM donasi WHERE id_donasi = ?", [id_donasi]);

        if (donasiExists.length === 0) {
            return NextResponse.json({ error: "Donasi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE donasi SET status_donasi = ?, tanggal_acc = ?, tanggal_donasi = ?, nama_penerima = ? WHERE id_donasi = ?",
            [status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_donasi]
        );

        return NextResponse.json({ message: "Donasi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Donasi" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_donasi } = await request.json();

        if (!id_donasi) {
            return NextResponse.json({ error: "id_donasi is required!" }, { status: 400 });
        }

        // Check if Donasi exists
        const [donasiExists] = await pool.query("SELECT * FROM donasi WHERE id_donasi = ?", [id_donasi]);

        if (donasiExists.length === 0) {
            return NextResponse.json({ error: "Donasi not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM donasi WHERE id_donasi = ?", [id_donasi]);

        return NextResponse.json({ message: "Donasi deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Donasi" }, { status: 500 });
    }
}
