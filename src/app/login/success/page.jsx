'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginSuccess() {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            console.log(document.cookie);
            router.replace('/home');
        } else {
            router.replace('/login');
        }
    }, [router]);

    return <div>Loading...</div>;
}
