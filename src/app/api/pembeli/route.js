import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT pembeli.id_pembeli, pembeli.nama, pembeli.no_telepon, pembeli.email, pembeli.poin_loyalitas, 
                   alamat.nama_alamat, alamat.lokasi
            FROM pembeli
            LEFT JOIN alamat ON pembeli.id_pembeli = alamat.id_pembeli
        `;

        let values = [];

        if (search) {
            query += `
                WHERE pembeli.nama LIKE ? 
                OR pembeli.email LIKE ? 
                OR pembeli.no_telepon LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [pembeli] = await pool.query(query, values);

        return NextResponse.json({ pembeli }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Pembeli" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama, no_telepon, email, password } = await request.json();

        if (!nama || !no_telepon || !email || !password) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [existingPembeli] = await pool.query("SELECT * FROM pembeli WHERE email = ? OR no_telepon = ?", [email, no_telepon]);

        if (existingPembeli.length > 0) {
            return NextResponse.json({ error: "Email or phone number already exists!" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO pembeli (nama, no_telepon, email, password, poin_loyalitas) VALUES (?, ?, ?, ?, ?)",
            [nama, no_telepon, email, hashedPassword, 0]
        );

        return NextResponse.json({ message: "Pembeli added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add Pembeli" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_pembeli, nama, no_telepon, email } = await request.json();

        if (!id_pembeli || !nama || !no_telepon || !email) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [pembeliExists] = await pool.query("SELECT * FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

        if (pembeliExists.length === 0) {
            return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE pembeli SET nama = ?, no_telepon = ?, email = ? WHERE id_pembeli = ?",
            [nama, no_telepon, email, id_pembeli]
        );

        return NextResponse.json({ message: "Pembeli updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Pembeli" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_pembeli } = await request.json();

        if (!id_pembeli) {
            return NextResponse.json({ error: "id_pembeli is required!" }, { status: 400 });
        }

        const [pembeliExists] = await pool.query("SELECT * FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

        if (pembeliExists.length === 0) {
            return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

        return NextResponse.json({ message: "Pembeli deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Pembeli" }, { status: 500 });
    }
}
