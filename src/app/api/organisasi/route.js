import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyUserRole } from '@/lib/auth';

export async function GET(request) {
    try {
        await verifyUserRole(["Owner", "Superuser"]);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT id_organisasi, nama, email, no_telepon, alamat
            FROM organisasi
        `;

        let values = [];

        if (search) {
            query += `
                WHERE nama LIKE ?
                OR email LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`];
        }

        const [organisasi] = await pool.query(query, values);

        return NextResponse.json({ organisasi }, { status: 200 });

    } catch (error) {
        console.error("GET Organisasi Error:", error);
        return NextResponse.json({ error: "Failed to fetch Organisasi" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama, email, password, no_telepon, alamat } = await request.json();

        if (!nama || !email || !password || !no_telepon || !alamat) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Cek apakah email sudah digunakan
        const [existingOrg] = await pool.query("SELECT * FROM organisasi WHERE email = ?", [email]);

        if (existingOrg.length > 0) {
            return NextResponse.json({ error: "Email already exists!" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert organisasi tanpa ID khusus dulu
        const [result] = await pool.query(
            "INSERT INTO organisasi (nama, email, password, no_telepon, alamat) VALUES (?, ?, ?, ?, ?)",
            [nama, email, hashedPassword, no_telepon, alamat]
        );

        // Ambil ID organisasi yang baru dibuat
        const id_organisasi = result.insertId;
        const id = `ORG${id_organisasi}`;

        // Update ID organisasi dengan format baru
        await pool.query("UPDATE organisasi SET id = ? WHERE id_organisasi = ?", [id, id_organisasi]);

        return NextResponse.json({ message: "Organisasi added successfully!", id, id_organisasi }, { status: 201 });

    } catch (error) {
        console.error("Error adding Organisasi:", error);
        return NextResponse.json({ error: "Failed to add Organisasi" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_organisasi, nama, email, no_telepon, alamat } = await request.json();

        if (!id_organisasi || !nama || !email || !no_telepon || !alamat) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Check if Organisasi exists
        const [orgExists] = await pool.query("SELECT * FROM organisasi WHERE id_organisasi = ?", [id_organisasi]);

        if (orgExists.length === 0) {
            return NextResponse.json({ error: "Organisasi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE organisasi SET nama = ?, email = ?, no_telepon = ?, alamat = ? WHERE id_organisasi = ?",
            [nama, email, no_telepon, alamat, id_organisasi]
        );

        return NextResponse.json({ message: "Organisasi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Organisasi" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_organisasi } = await request.json();

        if (!id_organisasi) {
            return NextResponse.json({ error: "id_organisasi is required!" }, { status: 400 });
        }

        // Check if Organisasi exists
        const [orgExists] = await pool.query("SELECT * FROM organisasi WHERE id_organisasi = ?", [id_organisasi]);

        if (orgExists.length === 0) {
            return NextResponse.json({ error: "Organisasi not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM organisasi WHERE id_organisasi = ?", [id_organisasi]);

        return NextResponse.json({ message: "Organisasi deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Organisasi" }, { status: 500 });
    }
}
