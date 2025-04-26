import pool from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    const [penitipResults] = await pool.query('SELECT * FROM Penitip WHERE email = ?', [email]);
    if (penitipResults.length > 0) {
      const user = penitipResults[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        if (!user.is_verified) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Akun belum terverifikasi. Silakan cek email Anda untuk verifikasi.'
          }), { status: 401 });
        }

        const token = jwt.sign({ id: user.id_penitip, role: 'penitip' }, JWT_SECRET, { expiresIn: '1h' });
        cookies().set('token', token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24,
        });

        return new Response(JSON.stringify({
          success: true,
          userType: 'penitip',
          userName: user.nama,
          token: token,
        }), { status: 200 });
      }
    }

    const [pembeliResults] = await pool.query('SELECT * FROM Pembeli WHERE email = ?', [email]);
    if (pembeliResults.length > 0) {
      const user = pembeliResults[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        if (!user.is_verified) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Akun belum terverifikasi. Silakan cek email Anda untuk verifikasi.'
          }), { status: 401 });
        }

        const token = jwt.sign({ id: user.id_pembeli, role: 'pembeli' }, JWT_SECRET, { expiresIn: '1h' });
        cookies().set('token', token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24,
        });

        return new Response(JSON.stringify({
          success: true,
          userType: 'pembeli',
          userName: user.nama,
          token: token,
        }), { status: 200 });
      }
    }

    const [pegawaiResults] = await pool.query('SELECT * FROM Pegawai WHERE email = ?', [email]);
    if (pegawaiResults.length > 0) {
      const user = pegawaiResults[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: user.id_pegawai, role: 'pegawai' }, JWT_SECRET, { expiresIn: '1h' });
        cookies().set('token', token, {
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

    return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), { status: 401 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
