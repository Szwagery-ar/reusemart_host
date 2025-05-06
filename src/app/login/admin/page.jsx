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
                    // Redirect user ke page sesuai role
                    const role = data.user.role;
                    if (role === 'penitip') router.push('/penitip');
                    else if (role === 'pembeli') router.push('/home');
                    else if (role === 'pegawai') router.push('/admin');
                    else if (role === 'organisasi') router.push('/organisasi');

                } else {
                    setCheckingSession(false); // Boleh tampilkan halaman login
                }
            } catch (err) {
                setCheckingSession(false); // Error? Tetap tampilkan halaman login
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
                router.push('/admin');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Terjadi kesalahan. Coba lagi nanti.');
        }
    };


    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_130.87%_392.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
            <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
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

                <div className='mb-3'>
                    <label htmlFor="password" className='block text-lg font-medium text-white mb-1'>Kata Sandi</label>
                    <div className="p-[2px] rounded-full bg-white focus-within:bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] transition duration-300">
                        <input
                            id="password"
                            className="w-full rounded-full px-6 py-2 text-black bg-white focus:outline-none"
                            type="password"
                            placeholder="•••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center">
                        <label
                            className="relative flex cursor-pointer items-center rounded-full p-3"
                            htmlFor="ripple-on"
                            data-ripple-dark="true"
                        >
                            <input
                                id="ripple-on"
                                type="checkbox"
                                className="peer relative h-5 w-5 cursor-pointer appearance-none rounded border bg-white border-slate-300 shadow hover:shadow-md transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-slate-400 before:opacity-0 before:transition-opacity checked:border-slate checked:bg-indigo-800 checked:before:bg-slate-400 hover:before:opacity-10"
                            />
                            <span className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </span>
                        </label>
                        <label className="cursor-pointer ml-3 text-white text-base"
                            htmlFor="ripple-on"
                        >
                            Ingat Saya
                        </label>
                    </div>
                    <p className="text-white font-medium">
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={() => setShowForgotPasswordModal(true)}
                        >
                            Lupa Password?
                        </span>
                    </p>
                </div>

                {error && <p className="text-red-400 mb-4">{error}</p>}

                <RippleButton type="submit" className="w-full text-white py-3 rounded-full font-semibold bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-[3px] border-white">
                    Masuk
                </RippleButton>
            </form>
        </div>
    );
}