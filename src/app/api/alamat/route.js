import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;
        const role = decoded.role;

        if (role !== "pembeli") {
            return NextResponse.json({ error: "Unauthorized - not a Pembeli" }, { status: 403 });
        }

        let query = `
            SELECT alamat.id_alamat, alamat.nama_alamat, alamat.lokasi, alamat.note, alamat.id_pembeli, pembeli.nama AS nama_pembeli
            FROM alamat
            JOIN pembeli ON alamat.id_pembeli = pembeli.id_pembeli
            WHERE alamat.id_pembeli = ?
        `;

        const [alamat] = await pool.query(query, [id_pembeli]);

        return NextResponse.json({ alamat }, { status: 200 });

    } catch (error) {
        console.error("Alamat GET error:", error);
        return NextResponse.json({ error: "Failed to fetch Alamat" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;

        if (decoded.role !== 'pembeli') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { nama_alamat, lokasi, note } = await request.json();

        if (!nama_alamat || !lokasi) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO alamat (nama_alamat, lokasi, note, id_pembeli) VALUES (?, ?, ?, ?)",
            [nama_alamat, lokasi, note, id_pembeli]
        );

        return NextResponse.json({ message: "Alamat added successfully!" }, { status: 201 });

    } catch (error) {
        console.error("POST error:", error);
        return NextResponse.json({ error: "Failed to add Alamat" }, { status: 500 });
    }
}



export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;

        if (decoded.role !== 'pembeli') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id_alamat, nama_alamat, lokasi, note } = await request.json();

        if (!id_alamat || !nama_alamat || !lokasi || !note) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Pastikan alamat milik user ini
        const [alamat] = await pool.query("SELECT * FROM alamat WHERE id_alamat = ? AND id_pembeli = ?", [id_alamat, id_pembeli]);
        if (alamat.length === 0) {
            return NextResponse.json({ error: "Alamat not found or not owned by you" }, { status: 404 });
        }

        await pool.query(
            "UPDATE alamat SET nama_alamat = ?, lokasi = ?, note = ? WHERE id_alamat = ?",
            [nama_alamat, lokasi, note, id_alamat]
        );

        return NextResponse.json({ message: "Alamat updated successfully!" });

    } catch (error) {
        console.error("PUT error:", error);
        return NextResponse.json({ error: "Failed to update Alamat" }, { status: 500 });
    }
}



export async function DELETE(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;

        if (decoded.role !== 'pembeli') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id_alamat } = await request.json();

        if (!id_alamat) {
            return NextResponse.json({ error: "id_alamat is required" }, { status: 400 });
        }

        // Pastikan alamat milik user
        const [alamat] = await pool.query("SELECT * FROM alamat WHERE id_alamat = ? AND id_pembeli = ?", [id_alamat, id_pembeli]);
        if (alamat.length === 0) {
            return NextResponse.json({ error: "Alamat not found or not owned by you" }, { status: 404 });
        }

        await pool.query("DELETE FROM alamat WHERE id_alamat = ?", [id_alamat]);

        return NextResponse.json({ message: "Alamat deleted successfully!" });

    } catch (error) {
        console.error("DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete Alamat" }, { status: 500 });
    }
}

