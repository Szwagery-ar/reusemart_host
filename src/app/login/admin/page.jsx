'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RippleButton from '@/components/RippleButton/RippleButton';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkIfLoggedIn = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();

                if (res.ok && data.success) {
                    const role = data.user.role;
                    if (role === 'penitip') router.push('/penitip');
                    else if (role === 'pembeli') router.push('/home');
                    else if (role === 'pegawai') router.push('/admin/profile');
                    else if (role === 'organisasi') router.push('/organisasi');
                } else {
                    setCheckingSession(false);
                }
            } catch (err) {
                setCheckingSession(false);
            }
        };

        checkIfLoggedIn();
    }, [router]);
    if (checkingSession) {
        return <div className="flex justify-center items-center h-screen">Mengecek sesi login...</div>;
    }

    const handleLoginSubmit = async (e) => {
        setError('');
        e.preventDefault();
        if (!email || !password) {
            setError('Email dan password wajib diisi!');
            return;
        }

        try {
            const res = await fetch('/api/login/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Gagal masuk!');
                return;
            }

            if (data.success) {
                router.push('/admin/profile');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Terjadi kesalahan. Coba lagi nanti.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_130.87%_392.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
            <form onSubmit={handleLoginSubmit} className="w-full max-w-md bg-transparent px-6">
                {/* Email Field */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-lg font-medium text-white mb-1">Email</label>
                    <div className="p-[2px] rounded-full bg-white focus-within:bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] transition duration-300">
                        <input
                            id="email"
                            type="email"
                            placeholder="email.anda@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-full px-6 py-2 text-black bg-white focus:outline-none"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-lg font-medium text-white mb-1">Kata Sandi</label>
                    <div className="p-[2px] rounded-full bg-white focus-within:bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] transition duration-300">
                        <input
                            id="password"
                            type="password"
                            placeholder="•••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-full px-6 py-2 text-black bg-white focus:outline-none"
                        />
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="remember" className="flex items-center cursor-pointer text-white text-base">
                        <input
                            id="remember"
                            type="checkbox"
                            className="mr-2 h-5 w-5 rounded border border-slate-300 bg-white shadow hover:shadow-md transition-all checked:bg-indigo-800"
                        />
                        Ingat Saya
                    </label>
                    <span
                        className="cursor-pointer hover:underline text-white font-medium"
                        onClick={() => setShowForgotPasswordModal(true)}
                    >
                        Lupa Password?
                    </span>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-400 mb-4">{error}</p>}

                {/* Submit Button */}
                <RippleButton
                    type="submit"
                    className="w-full text-white py-3 rounded-full font-semibold bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-[3px] border-white"
                >
                    Masuk
                </RippleButton>
            </form>
        </div>

    );
}