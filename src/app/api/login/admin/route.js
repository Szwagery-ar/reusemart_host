import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Cek Pegawai
    const [pegawaiResults] = await pool.query(`
      SELECT p.*, j.nama_jabatan FROM pegawai p
      LEFT JOIN jabatan j ON p.id_jabatan = j.id_jabatan
      WHERE p.email = ?
    `, [email]);
    if (pegawaiResults.length > 0) {
      const user = pegawaiResults[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: user.id_pegawai, role: 'pegawai', jabatan: user.nama_jabatan }, JWT_SECRET, { expiresIn: '1h' });

        // Menunggu cookies() secara asinkron
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24,
        });

        return new Response(JSON.stringify({
          success: true,
          userType: 'pegawai',
          userName: user.nama,
          token: token,
        }), { status: 200 });
      }
    }

    // Jika kredensial salah
    return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), { status: 401 });

  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
