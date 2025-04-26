import pool from '@/lib/db';

export async function POST(req) {
  const { email, otp } = await req.json();

  try {
    const [otpResult] = await pool.query(
      'SELECT * FROM PasswordResetOTPs WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );

    if (otpResult.length === 0) {
      return new Response(JSON.stringify({ valid: false, message: 'Kode OTP salah atau sudah kadaluarsa.' }), { status: 400 });
    }

    return new Response(JSON.stringify({ valid: true, message: 'OTP valid. Lanjut ke reset password.' }), { status: 200 });

  } catch (error) {
    console.error('Error verify OTP:', error);
    return new Response(JSON.stringify({ valid: false, message: 'Server error.' }), { status: 500 });
  }
}
