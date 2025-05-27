import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Semua role yang valid
    const userRoles = ['Penitip', 'Pembeli', 'Pegawai'];

    for (const role of userRoles) {
      const [result] = await pool.query(
        `SELECT * FROM ${role} WHERE email = ?`,
        [email]
      );

      if (result.length === 0) continue;

      const user = result[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) continue;

      // Jika bukan pegawai, cek verifikasi
      if (role !== 'Pegawai' && !user.is_verified) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Akun belum terverifikasi.',
        }), { status: 401 });
      }

      const payload = {
        id: user[`id_${role.toLowerCase()}`],
        role: role.toLowerCase(),
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      return new Response(JSON.stringify({
        success: true,
        token,
        role: payload.role,
        nama: user.nama,
      }), { status: 200 });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Email atau password salah.',
    }), { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error',
    }), { status: 500 });
  }
}