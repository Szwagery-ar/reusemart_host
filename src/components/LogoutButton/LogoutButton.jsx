'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState('/login');

  useEffect(() => {
    const getRoleAndRedirect = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user.role) {
            const role = data.user.role;
            if (role === 'pegawai') setRedirectPath('/login/admin');
            else setRedirectPath('/login');
          }
        }
      } catch (err) {
        console.error('Failed to get role:', err);
      }
    };

    getRoleAndRedirect();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      document.cookie = 'token=; path=/; max-age=0';
      router.push(redirectPath);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white hover:bg-white hover:text-indigo-700 px-4 py-3 text-sm font-semibold"
    >
      Logout
    </button>
  );
}
