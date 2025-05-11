'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from '../LogoutButton/LogoutButton';

import { LayoutDashboard, Package, Gift, LogOut, ContactRound, ShoppingBag, HeartHandshake  } from 'lucide-react';
import { UserRound, Handshake, Ribbon } from 'lucide-react';

import './AdminSidebar.css';
const menuByRole = {
    OWNER: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Barang', path: '/admin/barang', icon: Package },
        { name: 'Merchandise', path: '/admin/merchandise', icon: Gift },
        { name: 'Data Pegawai', path: '/admin/pegawai', icon: ContactRound },
        { name: 'Data Pembeli', path: '/admin/pembeli', icon: UserRound },
        { name: 'Data Penitip', path: '/admin/penitip', icon: Handshake },
        { name: 'Data Organisasi', path: '/admin/organisasi', icon: Ribbon },
        { name: 'Request Donasi', path: '/admin/reqdonasi', icon: ShoppingBag },
        { name: 'Donasi', path: '/admin/donasi', icon: HeartHandshake },

    ],
    ADMIN: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Barang', path: '/admin/barang', icon: Package },
        { name: 'Merchandise', path: '/admin/merchandise', icon: Gift },
        { name: 'Data Pegawai', path: '/admin/pegawai', icon: ContactRound},
        { name: 'Data Pembeli', path: '/admin/pembeli', icon: UserRound },
        { name: 'Data Penitip', path: '/admin/penitip', icon: Handshake },
        { name: 'Data Organisasi', path: '/admin/organisasi', icon: ShoppingBag },
    ],
    PEGAWAIGUDANG: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Data Penitip', path: '/admin/penitip', icon: Handshake },
    ],
    CS: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Data Penitip', path: '/admin/penitip', icon: Handshake  },
    ],
    QC: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Barang', path: '/admin/barang', icon: Package },
    ],
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
                } else {
                    setError('Failed to fetch user data');
                    if (res.status === 401) {
                        router.push('/login/admin');
                    }
                }
            } catch (err) {
                console.error("Gagal mengambil jabatan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const menuItems = menuByRole[jabatan] || [];

    return (
        <aside className="sidebar flex-row fixed w-64 h-screen z-50">
            <h2 className="text-center text-xl font-bold text-white m-6 my-[50px]">Ceritanya Logo</h2>
            <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a key={item.name} href={item.path} className='flex justify-end'>
                            <div
                                className={`flex items-center gap-2 px-4 py-3 w-100 ml-6 text-sm ${
                                    pathname === item.path
                                        ? 'sidebar-highlight font-semibold bg-white text-indigo-800'
                                        : 'text-white hover:font-semibold hover:border-b-2 hover:border-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <h1 className='z-10'>{item.name}</h1>
                            </div>
                        </a>
                    );
                })}
            </nav>
            <LogoutButton 
                icon={LogOut}
                className="flex items-center mt-2 gap-2 px-4 py-3 w-58 ml-6 text-sm text-white cursor-pointer hover:font-semibold hover:border-b-2 hover:border-white" 
            />
        </aside>
    );
}
