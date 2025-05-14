import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return new Response(JSON.stringify({ success: false, message: 'No token provided' }), { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let userData = null;

    if (decoded.role === 'penitip') {
      const [result] = await pool.query(`
        SELECT id_penitip, nama, email, no_ktp, no_telepon, src_img_profile, jml_barang_terjual, badge_level, komisi, poin_reward
        FROM Penitip 
        WHERE id_penitip = ?
      `, [decoded.id]);

      if (result.length > 0) {
        const user = result[0];
        userData = {
          id_penitip: user.id_penitip,
          nama: user.nama,
          email: user.email,
          role: decoded.role,
          no_ktp: user.no_ktp,
          no_telepon: user.no_telepon,
          src_img_profile: user.src_img_profile,
          jml_barang_terjual: user.jml_barang_terjual,
          badge_level: user.badge_level,
          komisi: user.komisi,
          poin_reward: user.poin_reward,
        };
      }

    } else if (decoded.role === 'pembeli') {
      const [result] = await pool.query(`
        SELECT id_pembeli, nama, email, no_telepon, poin_loyalitas, src_img_profile
        FROM Pembeli 
        WHERE id_pembeli = ?
      `, [decoded.id]);

      if (result.length > 0) {
        const user = result[0];
        userData = {
          id_pembeli: user.id_pembeli,
          nama: user.nama,
          email: user.email,
          no_telepon: user.no_telepon,
          poin_loyalitas: user.poin_loyalitas,
          src_img_profile: user.src_img_profile,
          role: decoded.role,
        };
      }

    } else if (decoded.role === 'pegawai') {
      const [result] = await pool.query(`
        SELECT 
          p.id_pegawai, 
          id,
          p.nama,
          p.no_telepon,
          p.email,
          p.tanggal_lahir,
          p.komisi,
          p.src_img_profile,
          j.nama_jabatan
        FROM Pegawai p
        LEFT JOIN Jabatan j ON p.id_jabatan = j.id_jabatan
        WHERE p.id_pegawai = ?
      `, [decoded.id]);

      if (result.length > 0) {
        const user = result[0];
        userData = {
          id_pegawai: user.id_pegawai,
          id: user.id,
          nama: user.nama,
          email: user.email,
          no_telepon: user.no_telepon,
          tanggal_lahir: user.tanggal_lahir,
          komisi: user.komisi,
          src_img_profile: user.src_img_profile,
          jabatan: user.nama_jabatan,
          role: decoded.role,
        };
      }
    } else if (decoded.role === 'organisasi') {
      const [result] = await pool.query(`
        SELECT 
          id_organisasi, 
          id, 
          nama, 
          email, 
          no_telepon, 
          alamat
        FROM Organisasi 
        WHERE id_organisasi = ?
      `, [decoded.id]);

      if (result.length > 0) {
        const user = result[0];
        userData = {
          id_organisasi: user.id_organisasi,
          id: user.id,
          nama: user.nama,
          email: user.email,
          no_telepon: user.no_telepon,
          alamat: user.alamat,
          role: decoded.role,
        };
      }
    }


    if (!userData) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });

  } catch (error) {
    console.error('Error verifying token:', error);
    return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token' }), { status: 401 });
  }
}
