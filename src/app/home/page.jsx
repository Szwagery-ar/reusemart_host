'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [error, setError] = useState(null);
    
    const handleLogout = async () => {
        const res = await fetch('/api/logout', {
            method: 'POST',
        });

        if (res.ok) {
            router.push('/login');
        }
    };


    return (
        <div>
            DASHBOARD

            <button onClick={handleLogout}>Logout</button>

        </div>
    );
}