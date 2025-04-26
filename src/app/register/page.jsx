'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import RippleButton from '../components/RippleButton/RippleButton';

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [telephone, setTelephone] = useState('');
    const [error, setError] = useState(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !telephone) {
            setError('Semua field wajib diisi!');
            return;
        }

        if (!isAgreed) {
            setError('Anda harus menyetujui Kebijakan Privasi!');
            return;
        }

        try {
            const res = await fetch('/api/register', {
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

            setShowModal(true);
        } catch (err) {
            console.error('Register error:', err);
            setError('Terjadi kesalahan. Coba lagi nanti.');
        }
    };


    return (
        <div className="min-h-screen w-full flex text-white bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)]">
            <img src="/images/login/Stringbackground.png" alt="background"
                className='absolute right-0 w-[50%] rotate-180'
            />
            <div className="hidden relative lg:flex w-1/2 items-center justify-center">
                <img src="/images/login/Strips.png" alt="garis"
                    className='absolute w-[25%] bottom-10 left-130'
                />
                <img
                    src="/images/login/Login 1.png" alt='gambar login'
                    className='absolute w-[60%] rounded-[40px] shadow-[-15px_15px_0px_0px_rgba(255,255,255,1.00)]'
                />
                <img src="/images/login/login 2.png" alt="gambar login"
                    className='absolute top-20 left-120 w-[30%] rounded-[40px] shadow-[15px_-15px_0px_0px_rgba(255,255,255,1.00)]'
                />
            </div>
            <div className="z-3 w-full lg:w-1/2 flex flex-col justify-center px-10 xl:px-40 lg:px-20 md:px-30 py-10">
                <h3 className='text-5xl lg:text-6xl md:text-6xl mb-5 font-[Montage-Demo] text-center'>BUAT AKUNMU SEKARANG</h3>
                <h5 className='text-lg text-center mb-4'>Bersama ribuan pembeli & penitip lainnya, yuk ramaikan gerakan barang berkelanjutan!    </h5>

                <form onSubmit={handleRegisterSubmit}>
                    <div className='mb-4'>
                        <label htmlFor="name" className='block text-lg font-medium'>Nama</label>
                        <div className='p-[2px] rounded-full bg-white focus-within:bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] transition duration-300'>
                            <input
                                id="name"
                                type="text"
                                placeholder='Nama Lengkap'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-full px-6 py-2 text-black bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="telephone" className='block text-lg font-medium text-white mb-1'>No. Telepon</label>
                        <div className='p-[2px] rounded-full bg-white focus-within:bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] transition duration-300'>
                            <input
                                id="telephone"
                                type="text"
                                placeholder='08123456789'
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                className="w-full rounded-full px-6 py-2 text-black bg-white focus:outline-none"
                            />
                        </div>
                    </div>

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


                    <div className="inline-flex items-center mb-3">
                        <label
                            className="relative flex cursor-pointer items-center rounded-full p-3"
                            htmlFor="ripple-on"
                            data-ripple-dark="true"
                        >
                            <input
                                id="ripple-on"
                                type="checkbox"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
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
                            Saya menyetujui semua Kebijakan Privasi
                        </label>
                    </div>

                    {error && <p className="text-red-400 mb-4">{error}</p>}

                    <RippleButton type="submit" className="w-full text-white py-3 rounded-full font-semibold bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-[3px] border-white">
                        Daftar
                    </RippleButton>
                </form>

                <p className="text-white mt-4 font-semibold text-center">
                    Sudah memiliki akun?{' '}
                    <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/login')}>Masuk</span>
                </p>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <h2 className="text-2xl font-bold mb-4 text-black">Cek Email Kamu!</h2>
                            <p className="text-black mb-6">Kami telah mengirimkan link verifikasi ke email Anda. Klik link tersebut untuk mengaktifkan akun.</p>
                            <button
                                className="w-full text-white py-2 rounded-full bg-indigo-700"
                                onClick={() => router.push('/login')}
                            >
                                Pergi ke Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
