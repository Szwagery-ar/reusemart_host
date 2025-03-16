import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");
        let query = `
            SELECT pegawai.id_pegawai, pegawai.nama, pegawai.email, pegawai.no_telepon, 
                   pegawai.tanggal_lahir, pegawai.komisi, pegawai.id_jabatan, jabatan.nama_jabatan 
            FROM pegawai 
            JOIN jabatan ON pegawai.id_jabatan = jabatan.id_jabatan
        `;

        let values = [];

        if (search) {
            query += `
                WHERE pegawai.nama LIKE ? 
                OR pegawai.email LIKE ? 
                OR jabatan.nama_jabatan LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [pegawai] = await pool.query(query, values);

        return NextResponse.json({ pegawai }, { status: 200 });

    } catch (error) {
        console.error("Database fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch Pegawai" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nama, email, password, no_telepon, tanggal_lahir, komisi, id_jabatan } = await request.json();

        if (!nama || !email || !password || !no_telepon || !tanggal_lahir || !id_jabatan) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [existingEmail] = await pool.query("SELECT email FROM pegawai WHERE email = ?", [email]);

        if (existingEmail.length > 0) {
            return NextResponse.json({ error: "Email already exists! Please use a different email." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO pegawai (nama, email, password, no_telepon, tanggal_lahir, komisi, id_jabatan) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nama, email, hashedPassword, no_telepon, tanggal_lahir, komisi, id_jabatan]
        );

        return NextResponse.json({ message: "Pegawai added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add Pegawai" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_pegawai, nama, email, no_telepon, tanggal_lahir, komisi, id_jabatan } = await request.json();

        if (!id_pegawai || !nama || !email || !no_telepon || !tanggal_lahir || !id_jabatan) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [existingPegawai] = await pool.query("SELECT * FROM pegawai WHERE id_pegawai = ?", [id_pegawai]);

        if (existingPegawai.length === 0) {
            return NextResponse.json({ error: "Pegawai not found!" }, { status: 404 });
        }

        const [existingEmail] = await pool.query("SELECT email FROM pegawai WHERE email = ?", [email]);

        if (existingEmail.length > 0) {
            return NextResponse.json({ error: "Email already exists! Please use a different email." }, { status: 400 });
        }

        await pool.query(
            "UPDATE pegawai SET nama = ?, email = ?, no_telepon = ?, tanggal_lahir = ?, komisi = ?, id_jabatan = ? WHERE id_pegawai = ?",
            [nama, email, no_telepon, tanggal_lahir, komisi, id_jabatan, id_pegawai]
        );

        return NextResponse.json({ message: "Pegawai updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Pegawai" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_pegawai } = await request.json();

        if (!id_pegawai) {
            return NextResponse.json({ error: "id_pegawai is required!" }, { status: 400 });
        }

        const [existingPegawai] = await pool.query("SELECT * FROM pegawai WHERE id_pegawai = ?", [id_pegawai]);

        if (existingPegawai.length === 0) {
            return NextResponse.json({ error: "Pegawai not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM pegawai WHERE id_pegawai = ?", [id_pegawai]);

        return NextResponse.json({ message: "Pegawai deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Pegawai" }, { status: 500 });
    }
}