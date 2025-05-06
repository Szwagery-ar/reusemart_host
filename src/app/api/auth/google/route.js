import { NextResponse } from 'next/server';

export async function GET() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;

    return NextResponse.redirect(googleAuthURL);
}
