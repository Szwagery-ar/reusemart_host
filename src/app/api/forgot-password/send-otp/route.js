import pool from '@/lib/db';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ success: false, message: 'Email wajib diisi.' }), { status: 400 });
  }

  try {
    const [userResult] = await pool.query('SELECT * FROM Pembeli WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Email tidak ditemukan.' }), { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(`
      INSERT INTO PasswordResetOTPs (email, otp, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?
    `, [email, otp, expiresAt, otp, expiresAt]);

    await sendEmail(
      email,
      'Kode OTP Reset Password Anda',
      `Kode OTP Anda: ${otp} \n\nKode ini berlaku selama 5 menit.`
    );

    return new Response(JSON.stringify({ success: true, message: 'OTP berhasil dikirim ke email Anda.' }), { status: 200 });

  } catch (error) {
    console.error('Error saat mengirim OTP:', error);
    return new Response(JSON.stringify({ success: false, message: 'Terjadi kesalahan server.' }), { status: 500 });
  }
}
