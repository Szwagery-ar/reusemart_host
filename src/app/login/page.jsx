'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import RippleButton from '@/components/RippleButton/RippleButton';
import GoogleButton from '@/components/GoogleButton/GoogleButton';


const GOOGLE_CLIENT_ID = '627202337032-4llrgl8hajk2bnna4n0s5tja5rffs0oq.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';



export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);


  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);


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
      const res = await fetch('/api/login', {
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
        if (data.userType === 'penitip') router.push('/penitip');
        else if (data.userType === 'pembeli') router.push('/home');
        else if (data.userType === 'organisasi') router.push('/organisasi');

      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Coba lagi nanti.');
    }
  };

  async function handleSendOtp() {
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setSuccessMessage('Kode OTP berhasil dikirim!');
      } else {
        setErrorMessage(data.error || 'Gagal mengirim OTP');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      console.log(data);

      if (res.ok && data.valid) {
        setStep(3);
        setSuccessMessage('OTP valid, lanjut ubah password.');
      } else {
        setErrorMessage(data.message || 'OTP salah atau kadaluarsa.');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }


  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Password tidak sama!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Password berhasil diganti!');
        setShowForgotPasswordModal(false);
      } else {
        setErrorMessage(data.message || 'Gagal mengganti password');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setShowForgotPasswordModal(false);
    setStep(1);
    setEmail('');
    setOtp('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  }



  const handleGoogleLogin = () => {
    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?`;
    const scope = [
      'openid',
      'email',
      'profile',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope,
      prompt: 'consent',
    });

    window.location.assign(`${googleAuthURL}${params.toString()}`);
  }


  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row text-white bg-[radial-gradient(ellipse_130.87%_392.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
      <img src="/images/login/Stringbackground.png" alt="background"
        className='absolute bottom-0 w-[50%]'
      />
      <div className="z-3 w-full lg:w-1/2 flex flex-col justify-center px-10 xl:px-25 lg:px-20 md:px-30 py-10">
        <h3 className='text-5xl lg:text-6xl md:text-6xl mb-3 font-[Montage-Demo] text-center'>MASUK AJA DULU</h3>
        <h5 className='text-lg text-center mb-4'>Login sekarang lalu lanjut eksplor barang-barang kece di <br /> ReUseMart.</h5>

        <GoogleButton className='w-full bg-white text-indigo-950 font-semibold py-3 px-6 rounded-full mb-4'
          onClick={handleGoogleLogin}>
          Masuk dengan Google
        </GoogleButton>

        <div className="flex items-center mb-3">
          <hr className="flex-grow border-white border-1" />
          <span className="mx-3">Atau</span>
          <hr className="flex-grow border-white border-1" />
        </div>

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

        <p className="text-white mt-4 font-semibold text-center">
          Belum punya akun?{' '}
          <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/register')}>Daftar</span>
        </p>
      </div>
      <div className="hidden relative lg:flex w-1/2 items-center justify-center">
        {/* <img src="/images/login/Strips.png" alt="garis"
          className='absolute w-[25%] top-10 right-130'
        /> */}
        <img
          src="/images/login/Gambar1.png" alt='gambar login'
          className=''
        />
        {/* <img src="/images/login/login 2.png" alt="gambar login"
          className='absolute bottom-20 right-120 w-[30%] rounded-[40px] shadow-[-15px_15px_0px_0px_rgba(255,255,255,1.00)]'
        /> */}
      </div>


      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-4xl w-full max-w-lg">
            {step === 1 && (
              <>
                <h2 className="text-4xl font-bold text-indigo-900 text-center mb-5">Lupa Password?</h2>
                <p className='text-black font-extralight text-md text-center mb-6'>Jangan khawatir, Kami akan bantu mereset password Anda.</p>
                <label htmlFor="email" className="block text-lg font-medium text-indigo-900 mb-1">Email</label>
                <div className="p-[2px] mb-6 rounded-full bg-white focus-within:bg-[radial-gradient(ellipse_130.87%_392.78%_at_-1.67%_100%,_#26C2FF_0%,_#220593_90%)] transition duration-300">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email kamu"
                    className="w-full rounded-full px-6 py-2 text-black bg-gray-100 focus:outline-none"
                  />

                </div>
                <RippleButton
                  onClick={handleSendOtp}
                  className="w-full text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-[3px] border-white"
                >
                  Kirim Kode OTP
                </RippleButton>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-black">Masukkan Kode OTP</h2>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Kode OTP"
                  className="w-full p-2 mb-4 border rounded text-black"
                />
                <button onClick={handleVerifyOtp} className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
                  Verifikasi OTP
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-black">Atur Password Baru</h2>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password Baru"
                  className="w-full p-2 mb-4 border rounded text-black"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi Password"
                  className="w-full p-2 mb-4 border rounded text-black"
                />
                <button onClick={handleResetPassword} className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
                  Ganti Password
                </button>
              </>
            )}

            <p className="text-indigo-900 mt-4 font-medium flex items-center justify-center gap-2 cursor-pointer" onClick={handleCloseModal}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Kembali ke Login?
            </p>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
          </div>
        </div>
      )}

    </div>
  );
}
