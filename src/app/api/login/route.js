import pool from '../../../lib/db';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    const [penitipResults] = await pool.query('SELECT * FROM Penitip WHERE email = ?', [email]);
    if (penitipResults.length > 0) {
      const isPasswordValid = await bcrypt.compare(password, penitipResults[0].password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: penitipResults[0].id_penitip, role: 'penitip' }, JWT_SECRET, { expiresIn: '1h' });
        return new Response(JSON.stringify({
          success: true,
          userType: 'penitip',
          userName: penitipResults[0].nama,
          token: token,
        }), { status: 200 });
      }
    }

    const [pembeliResults] = await pool.query('SELECT * FROM Pembeli WHERE email = ?', [email]);
    if (pembeliResults.length > 0) {
      const isPasswordValid = await bcrypt.compare(password, pembeliResults[0].password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: pembeliResults[0].id_pembeli, role: 'pembeli' }, JWT_SECRET, { expiresIn: '1h' });
        return new Response(JSON.stringify({
          success: true,
          userType: 'pembeli',
          userName: pembeliResults[0].nama,
          token: token,
        }), { status: 200 });
      }
    }

    const [pegawaiResults] = await pool.query('SELECT * FROM Pegawai WHERE email = ?', [email]);
    if (pegawaiResults.length > 0) {
      const isPasswordValid = await bcrypt.compare(password, pegawaiResults[0].password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: pegawaiResults[0].id_pegawai, role: 'pegawai' }, JWT_SECRET, { expiresIn: '1h' });
        return new Response(JSON.stringify({
          success: true,
          userType: 'pegawai',
          userName: pegawaiResults[0].nama,
          token: token, 
        }), { status: 200 });
      }
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), { status: 401 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
