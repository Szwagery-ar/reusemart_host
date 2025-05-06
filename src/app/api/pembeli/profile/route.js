import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

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