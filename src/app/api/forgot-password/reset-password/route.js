import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, newPassword, confirmPassword } = await req.json();

  if (!email || !newPassword || !confirmPassword) {
    return new Response(JSON.stringify({ success: false, message: 'Semua field wajib diisi.' }), { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return new Response(JSON.stringify({ success: false, message: 'Password dan konfirmasi tidak cocok.' }), { status: 400 });
  }

  try {
    const [userResult] = await pool.query('SELECT * FROM Pembeli WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Email tidak ditemukan.' }), { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE Pembeli SET password = ? WHERE email = ?', [hashedPassword, email]);

    await pool.query('DELETE FROM PasswordResetOTPs WHERE email = ?', [email]);

    return new Response(JSON.stringify({ success: true, message: 'Password berhasil direset.' }), { status: 200 });

  } catch (error) {
    console.error('Error reset password:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error.' }), { status: 500 });
  }
}
