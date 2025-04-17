'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [telephone, setTelephone] = useState('');
    const [error, setError] = useState(null);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !telephone) {
            setError('Semua field wajib diisi!');
            return;
        }

        try {
            const res = await fetch('/api/pembeli', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: name,
                    email,
                    password,
                    no_telepon: telephone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Gagal mendaftar!');
                return;
            }

            router.push('/login');
        } catch (err) {
            console.error('Register error:', err);
            setError('Terjadi kesalahan. Coba lagi nanti.');
        }
    };


    return (
        <div className="min-h-screen w-full flex text-white bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)]">
            <div className="hidden lg:flex w-1/2 items-center justify-center">
                <img
                    src="/images/Intersect.png"
                    alt="Ilustrasi login"
                    className="w-[85%] object-contain rounded-2xl"
                />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 xl:px-40 lg:px-20 md:px-30 py-10">
                <h3 className='text-5xl lg:text-5xl md:text-6xl mb-10 font-[Montage-Demo] text-center'>Buat akun Anda</h3>

                <form onSubmit={handleRegisterSubmit}>
                    <div className='mb-4'>
                        <label htmlFor="name" className='block text-lg font-medium'>Nama</label>
                        <input
                            id="name"
                            className="w-full bg-white text-black rounded-full px-6 py-2 mt-1"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="telephone" className='block text-lg font-medium'>No. Telepon</label>
                        <input
                            id="telephone"
                            className="w-full bg-white text-black rounded-full px-6 py-2 mt-1"
                            type="text"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                        />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor="email" className='block text-lg font-medium'>Email</label>
                        <input
                            id="email"
                            className="w-full bg-white text-black rounded-full px-6 py-2 mt-1"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className='mb-9'>
                        <label htmlFor="password" className='block text-lg font-medium'>Kata Sandi</label>
                        <input
                            id="password"
                            className="w-full bg-white text-black rounded-full px-6 py-2 mt-1"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center mb-6">
                        <label htmlFor="remember" className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="remember"
                                className="hidden peer"
                            />
                            <div className="w-6 h-6 bg-white rounded-lg transition-all duration-150 flex items-center justify-center opacity-0 peer-checked:opacity-100">
                                <svg
                                    className="w-4 h-4 text-black"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="ml-3 text-white text-base">Saya menyetujui semua Kebijakan Privasi</span>
                        </label>
                    </div>


                    {error && <p className="text-red-400 mb-4">{error}</p>}

                    <button
                        type="submit"
                        className="w-full text-white py-3 rounded-full font-semibold"
                        style={{
                            background: '#02143A'
                        }}
                    >
                        Daftar
                    </button>
                </form>

                <p className="text-white mt-4 font-semibold text-center">
                    Sudah memiliki akun?{' '}
                    <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/login')}>Masuk</span>
                </p>
            </div>
        </div>
    );
}
