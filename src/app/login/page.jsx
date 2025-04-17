'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi!');
      return;
    } else {
      setError('');
      console.log('Login:', email, password);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row text-white bg-[radial-gradient(ellipse_130.87%_392.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 xl:px-40 lg:px-20 md:px-30 py-20">
        <h3 className='text-5xl lg:text-5xl md:text-6xl mb-10 font-[Montage-Demo] text-center'>Masuk ke akun Anda</h3>

        <button className='w-full bg-white text-indigo-950 font-semibold py-3 px-6 rounded-full mb-6'>
          Login dengan Google
        </button>

        <div className="flex items-center mb-6">
          <hr className="flex-grow border-white border-1" />
          <span className="mx-3">Atau</span>
          <hr className="flex-grow border-white border-1" />
        </div>

        <form onSubmit={handleLoginSubmit}>
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
              <span className="ml-3 text-white text-base">Ingat Saya</span>
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
            Masuk
          </button>
        </form>

        <p className="text-white mt-4 font-semibold text-center">
          Tidak punya akun?{' '}
          <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/register')}>Daftar</span>
        </p>
      </div>
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <img
          src="/images/Intersect.png"
          alt="Ilustrasi login"
          className="w-[85%] object-contain rounded-2xl"
        />
      </div>
    </div>
  );
}
