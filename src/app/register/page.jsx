'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import RippleButton from '../../components/RippleButton/RippleButton';

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [telephone, setTelephone] = useState('');
    const [error, setError] = useState(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full flex text-white bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)]">
            <img src="/images/login/Stringbackground.png" alt="background"
                className='absolute right-0 w-[50%] rotate-180'
            />
            <div className="hidden relative lg:flex w-1/2 items-center justify-center">
                {/* <img src="/images/login/Strips.png" alt="garis"
                    className='absolute w-[25%] bottom-10 left-130'
                /> */}
                <img
                    src="/images/login/register.png" alt='gambar login'
                    className=''
                />
                {/* <img src="/images/login/login 2.png" alt="gambar login"
                    className='absolute top-20 left-120 w-[30%] rounded-[40px] shadow-[15px_-15px_0px_0px_rgba(255,255,255,1.00)]'
                /> */}
            </div>
            <div className="z-3 w-full lg:w-1/2 flex flex-col justify-center px-10 xl:px-25 lg:px-20 md:px-30 py-10">
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

                    <RippleButton type="submit" className="w-full text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-[3px] border-white">
                        {isLoading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-t- border-b-2 border-white"></div>
                        )}
                        {isLoading ? 'Mendaftar...' : 'Daftar'}
                    </RippleButton>
                </form>

                <p className="text-white mt-4 font-semibold text-center">
                    Sudah memiliki akun?{' '}
                    <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/login')}>Masuk</span>
                </p>



                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/25">
                        <div className="bg-white rounded-4xl shadow-2xl text-center max-w-lg w-full">
                            <div className="flex justify-center p-10 mb-3 bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] rounded-t-4xl rounded-b-[80%] ">
                                <div className="bg-white p-4 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10 text-blue-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 12H8m8-4H8m8 8H8m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Silahkan Cek Gmail Anda</h2>
                                <p className="text-gray-600 mb-6 text-md font-medium">
                                    Halo <b>{name}</b>, selamat datang di Reusemart!
                                    Terima kasih sudah bergabung. Untuk mulai menggunakan akunmu, kami perlu memverifikasi email kamu. Kami sudah kirimkan link verifikasinya, yuk cek email kamu dan konfirmasi!.
                                </p>
                                <RippleButton
                                    className="text-white font-bold py-2 px-6 rounded-full w-full mb-4 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-[3px]"
                                    onClick={() => router.push('/login')}
                                >
                                    Kembali ke Login!
                                </RippleButton>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
