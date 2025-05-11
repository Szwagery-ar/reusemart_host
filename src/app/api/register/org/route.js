import { registerUser } from '@/auth/emailVerification';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { nama, email, password, no_telepon } = await request.json();

        if (!nama || !email || !password || !no_telepon) {
            return NextResponse.json({ error: "Semua field wajib diisi!" }, { status: 400 });
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Format email tidak valid!" }, { status: 400 });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({
                error: "Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, serta angka."
            }, { status: 400 });
        }

        const [existingOrg] = await pool.query(
            "SELECT * FROM organisasi WHERE email = ? OR no_telepon = ?",
            [email, no_telepon]
        );
        if (existingOrg.length > 0) {
            return NextResponse.json({ error: "Email atau nomor telepon sudah terdaftar!" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO organisasi 
            (nama, email, password, no_telepon, is_verified) 
            VALUES (?, ?, ?, ?, ?)`,
            [nama, email, hashedPassword, no_telepon, 0]
        );

        const organisasiId = result.insertId;

        await registerUser(email, organisasiId);  // kirim email verifikasi

        return NextResponse.json({ message: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi." }, { status: 201 });

    } catch (error) {
        console.error("Register Organisasi Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat registrasi organisasi: " + error.message }, { status: 500 });
    }
}