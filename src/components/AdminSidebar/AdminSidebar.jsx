'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from '../LogoutButton/LogoutButton';

const menuByRole = {
    OWNER: [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Barang', path: '/admin/barang' },
        { name: 'Merchandise', path: '/admin/merchandise' },
        { name: 'Data Pegawai', path: '/admin/pegawai' },
        { name: 'Data Pembeli', path: '/admin/pembeli' },
        { name: 'Data Penitip', path: '/admin/penitip' },
        { name: 'Data Organisasi', path: '/admin/organisasi' },
    ],
    ADMIN: [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Barang', path: '/admin/barang' },
        { name: 'Merchandise', path: '/admin/merchandise' },
        { name: 'Data Pegawai', path: '/admin/pegawai' },
        { name: 'Data Pembeli', path: '/admin/pembeli' },
        { name: 'Data Penitip', path: '/admin/penitip' },
        { name: 'Data Organisasi', path: '/admin/organisasi' },
    ],
    PEGAWAIGUDANG: [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Data Penitip', path: '/admin/penitip' },
    ],
    CS: [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Data Penitip', path: '/admin/penitip' },
    ],
    QC: [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Barang', path: '/admin/barang' },
    ],
    // Tambahkan sesuai jabatan lainnya
};

export default function AdminSidebar() {
    const [jabatan, setJabatan] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (res.ok && data.success) {
                    setJabatan(data.user.jabatan?.toUpperCase());
                }
            } catch (err) {
                console.error("Gagal mengambil jabatan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <aside className="w-64 p-4 text-gray-500">Memuat menu...</aside>;
    }

    const menuItems = menuByRole[jabatan] || [];

    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 p-4 shadow-md z-50">
            <h2 className="text-xl font-bold text-indigo-700 mb-6">Admin Panel</h2>
            <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => router.push(item.path)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${pathname === item.path
                                ? 'bg-indigo-100 text-indigo-800 font-semibold'
                                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                    >
                        {item.name}
                    </button>
                ))}
            </nav>
            <LogoutButton />
        </aside>
    );
}
