'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if(window.scrollY > lastScrollY) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(window.scrollY);
        }
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [lastScrollY])

    return (
        <div className={`flex d-flex justify-center transition-all ${showNavbar ? 'top-0' : '-top-[70px]'} fixed w-full z-99`}>
            <div className="mt-2 px-2 flex flex-row justify-between items-center w-6xl h-[60px] border-3 border-[#220593] bg-white rounded-full ">
                <div className="pl-5 justify-center text-indigo-900 text-3xl font-normal font-['Montage']">
                    Ceritanya Logo
                </div>

                <div className="inline-flex justify-start items-center gap-10">
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Tentang Kami</div>
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Belanja</div>
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Ikut Jualan</div>
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Bantuan</div>
                </div>

                <div className="px-5 py-2 text-center justify-center text-white text-sm font-semibold leading-normal rounded-[100px] bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                    Masuk/Daftar
                </div>
            </div>
        </div>
    );
}
