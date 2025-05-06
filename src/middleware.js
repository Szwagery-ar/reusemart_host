import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/login/admin',
  '/',
];

async function verifyToken(token) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return await jwtVerify(token, secret);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await verifyToken(token);
    const role = payload.role;

    if (pathname.startsWith('/admin') && role !== 'pegawai') {
      return NextResponse.redirect(new URL('/login/admin', request.url));
    }

    if (pathname.startsWith('/organisasi') && role !== 'organisasi') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/penitip') && role !== 'penitip') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/pembeli') && role !== 'pembeli') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error('[Middleware] JWT Error:', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/organisasi/:path*',
    '/penitip/:path*',
    '/pembeli/:path*',
    '/api/:path*',
  ],
};
