'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogoutButton from '../LogoutButton/LogoutButton';

const menuItems = [
    { name: 'Profil Saya', path: '/profile' },
    { name: 'Tukar Poin', path: '/profile/tukarpoin' },
    { name: 'Riwayat', path: '/profile/riwayat' },
];

export default function ProfileSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <aside className="absolute w-64 h-screen rounded-4xl bg-[radial-gradient(ellipse_200.87%_120.78%_at_185.67%_0.00%,_#26C2FF_0%,_#220593_100%)] z-50">
            <nav className="flex flex-col py-15 justify-center items-center">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => router.push(item.path)}
                        className={`w-full px-4 py-3 text-sm font-medium ${pathname === item.path
                            ? 'bg-white text-indigo-800 font-semibold'
                            : 'text-white hover:bg-white hover:text-indigo-700 font-semibold'
                            }`}
                    >
                        {item.name}
                    </button>
                ))}
                <LogoutButton className="w-full px-4 py-3 text-sm text-white font-semibold text-center hover:bg-white hover:text-indigo-700"/>
            </nav>
        </aside>
    );
}
