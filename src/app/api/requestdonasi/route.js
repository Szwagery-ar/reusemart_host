import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT requestdonasi.id_request, requestdonasi.tanggal_request, requestdonasi.deskripsi, 
                   requestdonasi.status_request, requestdonasi.id_organisasi, organisasi.nama AS nama_organisasi
            FROM requestdonasi
            LEFT JOIN organisasi ON requestdonasi.id_organisasi = organisasi.id_organisasi
        `;

        let values = [];

        if (search) {
            query += `
                WHERE requestdonasi.deskripsi LIKE ? 
                OR requestdonasi.status_request LIKE ?
                OR organisasi.nama LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [requestDonasi] = await pool.query(query, values);

        return NextResponse.json({ requestDonasi }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch RequestDonasi" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { tanggal_request, deskripsi, status_request, id_organisasi } = await request.json();

        if (!tanggal_request || !deskripsi || !status_request || !id_organisasi) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [orgExists] = await pool.query("SELECT id_organisasi FROM organisasi WHERE id_organisasi = ?", [id_organisasi]);

        if (orgExists.length === 0) {
            return NextResponse.json({ error: "Organisasi not found!" }, { status: 404 });
        }

        await pool.query(
            "INSERT INTO requestdonasi (tanggal_request, deskripsi, status_request, id_organisasi) VALUES (?, ?, ?, ?)",
            [tanggal_request, deskripsi, status_request, id_organisasi]
        );

        return NextResponse.json({ message: "RequestDonasi added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add RequestDonasi" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_request, tanggal_request, deskripsi, status_request } = await request.json();

        if (!id_request || !tanggal_request || !deskripsi || !status_request) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [requestExists] = await pool.query("SELECT * FROM requestdonasi WHERE id_request = ?", [id_request]);

        if (requestExists.length === 0) {
            return NextResponse.json({ error: "RequestDonasi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE requestdonasi SET tanggal_request = ?, deskripsi = ?, status_request = ? WHERE id_request = ?",
            [tanggal_request, deskripsi, status_request, id_request]
        );

        return NextResponse.json({ message: "RequestDonasi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update RequestDonasi" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_request } = await request.json();

        if (!id_request) {
            return NextResponse.json({ error: "id_request is required!" }, { status: 400 });
        }

        const [requestExists] = await pool.query("SELECT * FROM requestdonasi WHERE id_request = ?", [id_request]);

        if (requestExists.length === 0) {
            return NextResponse.json({ error: "RequestDonasi not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM requestdonasi WHERE id_request = ?", [id_request]);

        return NextResponse.json({ message: "RequestDonasi deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete RequestDonasi" }, { status: 500 });
    }
}
