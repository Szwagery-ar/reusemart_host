import jwt from 'jsonwebtoken';
import pool from './db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyTokenAndCheckAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) throw new Error('No token provided');

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'pegawai') throw new Error('Not a pegawai');

    const [pegawaiData] = await pool.query(`
      SELECT p.*, j.nama_jabatan 
      FROM pegawai p
      JOIN jabatan j ON p.id_jabatan = j.id_jabatan
      WHERE p.id_pegawai = ?
    `, [decoded.id]);

    if (pegawaiData.length === 0) throw new Error('Pegawai not found');

    const pegawai = pegawaiData[0];
    if (pegawai.nama_jabatan !== 'admin') throw new Error('Forbidden');

    return pegawai; // jika admin, kembalikan datanya

  } catch (err) {
    throw new Error(err.message);
  }
}