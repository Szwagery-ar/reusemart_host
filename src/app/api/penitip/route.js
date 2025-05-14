import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyUserRole } from '@/lib/auth';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';
import fs from 'fs';

export async function GET(request) {
    try {
        await verifyUserRole(["CS"]);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
        SELECT penitip.id_penitip, penitip.id, penitip.nama, penitip.no_ktp, penitip.no_telepon, 
               penitip.email, penitip.badge_level, foto_ktp, is_verified,
               COUNT(barang.id_barang) AS total_barang
        FROM penitip
        LEFT JOIN barang ON penitip.id_penitip = barang.id_penitip
      `;

        let values = [];

        if (search) {
            query += `
          WHERE penitip.nama LIKE ? OR penitip.email LIKE ? OR penitip.no_telepon LIKE ?
        `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        query += ` GROUP BY penitip.id_penitip`;

        const [penitip] = await pool.query(query, values);

        return NextResponse.json({ penitip }, { status: 200 });

    } catch (error) {
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: "Anda tidak memiliki akses ke halaman ini" }, { status: 403 });
        }
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: "Token tidak valid atau telah kedaluwarsa" }, { status: 401 });
        }

        console.error("Uncaught error:", error); // hanya log error sistem
        return NextResponse.json({ error: "Gagal mengambil data penitip" }, { status: 500 });
    }

}

export async function POST(request) {
    try {
        await verifyUserRole(["CS"]);

        const formData = await request.formData();
        const nama = formData.get("nama");
        const email = formData.get("email");
        const no_ktp = formData.get("no_ktp");
        const no_telepon = formData.get("no_telepon");
        const password = formData.get("password");
        const file = formData.get("foto_ktp"); // ⬅ file: Blob

        if (!nama || !no_ktp || !no_telepon || !email || !password || !file) {
            return NextResponse.json({ error: "Semua field termasuk foto KTP wajib diisi" }, { status: 400 });
        }

        // Validasi file: apakah benar file
        if (typeof file.name !== "string") {
            return NextResponse.json({ error: "File foto KTP tidak valid" }, { status: 400 });
        }

        // Simpan file ke /public/uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `ktp-${Date.now()}-${file.name}`;
        const filePath = `./public/uploads/${fileName}`;
        await fs.promises.writeFile(filePath, buffer);
        const fotoUrl = `/uploads/${fileName}`;

        // Validasi email (seperti sebelumnya)
        const [exists] = await pool.query("SELECT * FROM penitip WHERE email = ? OR no_ktp = ?", [email, no_ktp]);
        if (exists.length > 0) {
            return NextResponse.json({ error: "Email atau No KTP sudah terdaftar!" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO penitip (nama, no_ktp, no_telepon, email, password, foto_ktp, badge_level) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nama, no_ktp, no_telepon, email, hashedPassword, fotoUrl, "novice"]
        );

        const id_penitip = result.insertId;
        const id = `T${id_penitip}`;
        await pool.query("UPDATE penitip SET id = ? WHERE id_penitip = ?", [id, id_penitip]);

        const [newPenitipRows] = await pool.query("SELECT * FROM penitip WHERE id_penitip = ?", [id_penitip]);
        return NextResponse.json({ message: "Penitip added successfully!", penitipBaru: newPenitipRows[0] }, { status: 201 });

    } catch (error) {
        console.error("Failed to add Penitip:", error);
        return NextResponse.json({ error: "Failed to add Penitip" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        await verifyUserRole(["CS"]);

        const {
            id_penitip,
            nama,
            no_ktp,
            no_telepon,
            email,
            badge_level,
            is_verified,
            password
        } = await request.json();

        if (
            !id_penitip ||
            !nama ||
            !no_ktp ||
            !no_telepon ||
            !email ||
            !badge_level ||
            typeof is_verified === "undefined"
        ) {
            return NextResponse.json(
                { error: "Semua field wajib diisi termasuk status verifikasi!" },
                { status: 400 }
            );
        }

        const [penitipExists] = await pool.query(
            "SELECT * FROM penitip WHERE id_penitip = ?",
            [id_penitip]
        );

        if (penitipExists.length === 0) {
            return NextResponse.json(
                { error: "Penitip tidak ditemukan!" },
                { status: 404 }
            );
        }

        await pool.query(
            `UPDATE penitip 
                SET nama = ?, no_ktp = ?, no_telepon = ?, email = ?, badge_level = ?, is_verified = ? 
                WHERE id_penitip = ?`,
            [
                nama,
                BigInt(no_ktp),
                BigInt(no_telepon),
                email,
                badge_level,
                is_verified,
                id_penitip
            ]
        );

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "UPDATE penitip SET password = ? WHERE id_penitip = ?",
                [hashedPassword, id_penitip]
            );
        }

        return NextResponse.json(
            { message: "Penitip updated successfully!" },
            { status: 200 }
        );

    } catch (error) {
        if (error instanceof ForbiddenError) {
            return NextResponse.json(
                { error: "Anda tidak memiliki akses ke halaman ini" },
                { status: 403 }
            );
        }

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { error: "Token tidak valid atau telah kedaluwarsa" },
                { status: 401 }
            );
        }

        console.error("Failed to update Penitip:", error);
        return NextResponse.json(
            { error: "Gagal memperbarui penitip" },
            { status: 500 }
        );
    }
}


export async function DELETE(request) {
    try {
        await verifyUserRole(["CS"]);

        const { id_penitip } = await request.json();

        if (!id_penitip) {
            return NextResponse.json({ error: "id_penitip is required!" }, { status: 400 });
        }

        const [penitipExists] = await pool.query("SELECT * FROM penitip WHERE id_penitip = ?", [id_penitip]);

        if (penitipExists.length === 0) {
            return NextResponse.json({ error: "Penitip not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM penitip WHERE id_penitip = ?", [id_penitip]);

        return NextResponse.json({ message: "Penitip deleted successfully!" }, { status: 200 });

    } catch (error) {
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: "Anda tidak memiliki akses ke halaman ini" }, { status: 403 });
        }
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: "Token tidak valid atau telah kedaluwarsa" }, { status: 401 });
        }

        console.error("Failed to delete Penitip:", error);
        return NextResponse.json({ error: "Failed to delete Penitip" }, { status: 500 });
    }
}
