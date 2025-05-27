import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'No token provided' }), { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, role } = decoded;

    let userData = null;

    if (role === 'penitip') {
      const [rows] = await pool.query(`SELECT id_penitip, nama, email FROM Penitip WHERE id_penitip = ?`, [id]);
      userData = rows[0];
    } else if (role === 'pembeli') {
      const [rows] = await pool.query(`SELECT id_pembeli, nama, email, poin_loyalitas, src_img_profile FROM Pembeli WHERE id_pembeli = ?`, [id]);
      userData = rows[0];
    } else if (role === 'organisasi') {
      const [rows] = await pool.query(`SELECT id_organisasi, nama, email FROM Organisasi WHERE id_organisasi = ?`, [id]);
      userData = rows[0];
    }

    if (!userData) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, user: userData, role }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), { status: 401 });
  }
}