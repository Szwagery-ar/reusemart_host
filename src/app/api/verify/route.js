import { verifyTokenAndUpdate } from '@/auth/emailVerification';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) throw new Error('Token missing');

    const { id } = await verifyTokenAndUpdate(token);

    await pool.query(`UPDATE pembeli SET is_verified = 1 WHERE id_pembeli = ?`, [id]);

    return Response.redirect(new URL('/login', request.url), 302);
  } catch (err) {
    console.error('Verification error:', err);
    return new Response('Verification failed: ' + err.message, { status: 400 });
  }
}
