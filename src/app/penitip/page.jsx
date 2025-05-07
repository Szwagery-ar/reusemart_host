import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton/LogoutButton';

export default async function PenitipDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/login');

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        redirect('/login');
    }

    if (decoded.role !== 'penitip') redirect('/login');

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
        headers: { Cookie: `token=${token}` },
        cache: 'no-store',
    });
    const { user } = await res.json();

    return (
        <h1>Test aja dulu buat dashboard penitip ya</h1>
    );
}
