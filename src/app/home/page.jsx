'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));

        console.log('Isi cookie sekarang:', document.cookie);

        if (token) {
            fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.split('=')[1]}`, // Ambil token dari cookies
                },
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    const userData = await res.json();
                    if (userData.success) {
                        setUser(userData.user);
                    } else {
                        setError(userData.message || 'Failed to fetch user data');
                        router.push('/login');
                    }
                } else {
                    setError('Failed to fetch user data');
                    if (res.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                setError('Error fetching user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });

            // Hapus cookie client-side
            document.cookie = 'token=; path=/; max-age=0';

            // Setelah itu redirect ke login
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">DASHBOARD</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                        >
                            Logout
                        </button>
                    </div>

                    {user && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Welcome, {user.nama || user.username || 'User'}!
                            </h2>
                            {user.email && (
                                <p className="text-gray-600 mt-1">{user.email}</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Dashboard Content</h3>
                        <p className="text-gray-600">
                            Your dashboard content goes here...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
