'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RippleButton from '../RippleButton/RippleButton';

export default function Navbar() {
    const router = useRouter();

    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [user, setUser] = useState(null);

    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));

        if (token) {
            fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.split('=')[1]}`, 
                },
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    const userData = await res.json();
                    if (userData.success) {
                        setUser(userData.user);
                    } else {
                        setUser(null);
                        setError(userData.message || 'User not authenticated');
                    }
                } else {
                    setUser(null);
                    if (res.status !== 401) {
                        console.error('User not authenticated');
                    }
                }
            } catch (err) {
                setUser(null);
                console.error('Error fetching user data:', err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, [router]);


    const getFirstLetter = (name) => {
        return name ? name.charAt(0).toUpperCase() : '';
    };

    const generateStableColor = (input) => {
        const colors = ['#EF4444', '#F97316', '#10B981', '#8B5CF6', '#EAB308'];
        if (!input) return colors[0];
        const charCode = input.charCodeAt(0);
        const index = charCode % colors.length;
        return colors[index];
    };


    return (
        <div className={`flex d-flex justify-center transition-all ${showNavbar ? 'top-0' : '-top-[70px]'} fixed w-full z-99`}>
            <div className="mt-2 px-2 flex flex-row justify-between items-center w-6xl h-[60px] border-3 border-[#220593] bg-white rounded-full ">
                <div className="pl-5 justify-center text-indigo-900 text-3xl font-normal font-['Montage'] cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    Ceritanya Logo
                </div>

                <div className="inline-flex justify-start items-center gap-10">
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight cursor-pointer" onClick={() => router.push('/belanja')}>Belanja</div>
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Tentang Kami</div>
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Ikut Jualan</div>
                    <div className="text-center justify-center text-neutral-800 text-md font-medium leading-tight">Bantuan</div>
                </div>

                <div className="flex items-center">
                    {loadingUser ? (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0%,_#26C2FF_0%,_#220593_90%)] animate-pulse" >
                            <div className="w-10 h-10 bg-white rounded-full"></div>
                        </div>

                    ) : user ? (
                        <div
                            className="p-1 rounded-full cursor-pointer flex items-center justify-center w-11 h-11"
                            onClick={() => router.push('/profile')}
                            style={{
                                background: 'radial-gradient(ellipse 130.87% 392.78% at 121.67% 0%, #26C2FF 0%, #220593 90%)',
                            }}
                        >
                            <div className=" w-9 h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: generateStableColor(user.nama || user.email) }}>
                                {user.src_img_profile ? (
                                    <img
                                        src={user.src_img_profile}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full "
                                    />
                                ) : (
                                    <span className="text-white text-lg font-semibold">
                                        {getFirstLetter(user.nama)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <RippleButton>
                            <div
                                className="px-5 py-2 text-center justify-center text-white text-sm font-semibold leading-normal rounded-[100px] bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] cursor-pointer"
                                onClick={() => router.push('/login')}
                            >
                                Masuk/Daftar
                            </div>

                        </RippleButton>
                    )}
                </div>

            </div>
        </div>
    );
}
