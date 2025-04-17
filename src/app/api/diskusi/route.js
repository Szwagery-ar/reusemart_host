import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT d.id_diskusi, d.isi_diskusi, p.nama AS pembeli_name, b.nama_barang, p.email AS pembeli_email,
                   pen.nama AS penitip_name, peg.nama AS pegawai_name
            FROM diskusi d
            JOIN barang b ON d.id_barang = b.id_barang
            JOIN pembeli p ON d.id_pembeli = p.id_pembeli
            LEFT JOIN penitip pen ON d.id_penitip = pen.id_penitip
            LEFT JOIN pegawai peg ON d.id_pegawai = peg.id_pegawai
        `;
        let values = [];

        if (search) {
            query += ` WHERE b.nama_barang LIKE ? OR p.nama LIKE ? OR p.email LIKE ?`;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [diskusi] = await pool.query(query, values);

        return NextResponse.json({ diskusi }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Diskusi" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { id_barang, id_pembeli, id_penitip, id_pegawai, isi_diskusi } = await request.json();

        if (!id_barang || !isi_diskusi) {
            return NextResponse.json({ error: "Masukkan id_barang dan isi_diskusi!" }, { status: 400 });
        }

        const rolesFilled = [id_pembeli, id_penitip, id_pegawai].filter(role => role !== null && role !== undefined);

        if (rolesFilled.length === 0) {
            return NextResponse.json({
                error: "minimal ada salah satu dari id_pembeli, id_penitip, or id_pegawai!"
            }, { status: 400 });
        }

        if (rolesFilled.length > 1) {
            return NextResponse.json({
                error: "Cuman boleh 1 (id_pembeli, id_penitip, or id_pegawai) setiap inputan!"
            }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO diskusi (id_barang, id_pembeli, id_penitip, id_pegawai, isi_diskusi) VALUES (?, ?, ?, ?, ?)",
            [id_barang, id_pembeli || null, id_penitip || null, id_pegawai || null, isi_diskusi]
        );

        return NextResponse.json({ message: "Diskusi berhasil dibuat!" }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal membuat diskusi" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_diskusi, isi_diskusi } = await request.json();

        if (!id_diskusi || !isi_diskusi) {
            return NextResponse.json({ error: "id_diskusi and isi_diskusi are required!" }, { status: 400 });
        }

        const [diskusiExists] = await pool.query("SELECT * FROM diskusi WHERE id_diskusi = ?", [id_diskusi]);

        if (diskusiExists.length === 0) {
            return NextResponse.json({ error: "Diskusi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE diskusi SET isi_diskusi = ? WHERE id_diskusi = ?",
            [isi_diskusi, id_diskusi]
        );

        return NextResponse.json({ message: "Diskusi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Diskusi" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_diskusi } = await request.json();

        if (!id_diskusi) {
            return NextResponse.json({ error: "id_diskusi is required!" }, { status: 400 });
        }

        const [diskusiExists] = await pool.query("SELECT * FROM diskusi WHERE id_diskusi = ?", [id_diskusi]);

        if (diskusiExists.length === 0) {
            return NextResponse.json({ error: "Diskusi not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM diskusi WHERE id_diskusi = ?", [id_diskusi]);

        return NextResponse.json({ message: "Diskusi deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Diskusi" }, { status: 500 });
    }
}
