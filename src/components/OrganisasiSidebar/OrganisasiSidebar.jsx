'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from '../LogoutButton/LogoutButton';

import { LayoutDashboard, Package, ClipboardList, LogOut } from 'lucide-react';

import './OrganisasiSidebar.css';

export default function OrganisasiSidebar() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const userData = await res.json();
  
                if (res.ok && userData.success) {
                    setUser(userData.user);
                } else {
                    setError('Failed to fetch user data');
                    if (res.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error("Error fetching user data", err);
            }
        };
  
        fetchUserData();
    }, []);

    const menuItems = [
        { name: 'Dashboard', path: '/organisasi', icon: LayoutDashboard },
        { name: 'Barang Titipan', path: '/penitip/barang', icon: Package },
        { name: 'Riwayat Transaksi', path: '/penitip/riwayat', icon: ClipboardList },
    ];

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