import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userInfoRes.json();

    const email = profile.email;
    const name = profile.name;
    const picture = profile.picture;

    // Cek user di database
    const [existingUser] = await pool.query(`SELECT * FROM pembeli WHERE email = ?`, [email]);

    let userId;

    if (existingUser.length > 0) {
      userId = existingUser[0].id_user;
    } else {
      // Buat password random
      const randomPassword = (Math.random() + 1).toString(36).substring(7);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const insertResult = await pool.query(
        `INSERT INTO pembeli (nama, email, password, no_telepon, src_img_profile, is_verified) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, 0, picture, 1]
      );
      userId = insertResult[0].insertId;
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'pembeli' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Kirim token ke client (bisa disimpan di cookie / redirect dengan token)
    // const response = NextResponse.redirect('http://localhost:3000/home');
    const urlWithToken = new URL('/login/success', request.nextUrl.origin);
    urlWithToken.searchParams.set('token', token);

    return NextResponse.redirect(urlWithToken.toString());

    // response.cookies.set('token', token, {
    //   httpOnly: true,
    //   path: '/',
    //   secure: process.env.NODE_ENV === 'production', // Wajib secure kalau production
    //   sameSite: 'Lax',
    //   maxAge: 7 * 24 * 60 * 60, // 7 hari
    // });

    // console.log("Token set in cookies:", token);
    // return response;
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}