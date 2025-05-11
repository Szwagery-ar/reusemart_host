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

        // Cek apakah email sudah ada di pegawai
        const [existingPegawai] = await pool.query("SELECT * FROM pegawai WHERE email = ?", [email]);
        if (existingPegawai.length > 0) {
            return NextResponse.json({ error: "Email already exists in Pegawai!" }, { status: 400 });
        }

        // Cek apakah email sudah ada di pembeli
        const [existingPembeli] = await pool.query("SELECT * FROM pembeli WHERE email = ?", [email]);
        if (existingPembeli.length > 0) {
            return NextResponse.json({ error: "Email already exists in Pembeli!" }, { status: 400 });
        }

        // Cek apakah email sudah ada di organisasi
        const [existingOrg] = await pool.query("SELECT * FROM organisasi WHERE email = ?", [email]);
        if (existingOrg.length > 0) {
            return NextResponse.json({ error: "Email already exists in Organisasi!" }, { status: 400 });
        }

        // Cek apakah email sudah ada di penitip
        const [existingPenitip] = await pool.query("SELECT * FROM penitip WHERE email = ? OR no_ktp = ?", [email, no_ktp]);
        if (existingPenitip.length > 0) {
            return NextResponse.json({ error: "Email or No KTP already exists in Penitip!" }, { status: 400 });
        }

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
        const generatedId = 'ORG' + organisasiId;

        await pool.query(
            `UPDATE organisasi SET id = ? WHERE id_organisasi = ?`,
            [generatedId, organisasiId]
        );

        await registerUser(email, organisasiId);  // kirim email verifikasi

        return NextResponse.json({ message: "Registrasi berhasil. Silakan cek email Anda untuk verifikasi." }, { status: 201 });
    } catch (error) {
        console.error("Register Organisasi Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat registrasi organisasi: " + error.message }, { status: 500 });
    }
}