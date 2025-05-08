'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

export default function PenitipProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
    
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                        console.log("User data:", data);
                    } else {
                      setUser(null);
                      setError(userData.message || 'User not authenticated');
                      router.push('/login');
                    }
                } else {
                  setUser(null);
                  setError(userData.message || 'User not authenticated');
                  if (res.status === 401) {
                      router.push('/login');
                  }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Terjadi kesalahan');
            } finally {
                setUserLoading(false);
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

    function formatRupiah(value) {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      }

    return (
        <div className="p-6 relative">
            <div className="flex flex-col justify-center gap-[40px] w-full rounded-4xl bg-white">
                <div className="flex gap-5 items-center w-full">
                    <div className="flex items-center justify-center">
                        {user?.src_img_profile ? (
                            <div
                                className="p-0.5 rounded-full cursor-pointer flex items-center justify-center w-30 h-30"
                                onClick={() => router.push('/profile')}
                                style={{
                                    background: 'radial-gradient(ellipse 130.87% 392.78% at 121.67% 0%, #26C2FF 0%, #220593 90%)',
                                }}
                            >
                                <img
                                    src={user.src_img_profile}
                                    alt="Profile Picture"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>

                        ) : (
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                                style={{ backgroundColor: generateStableColor(user?.nama || user?.email) }}
                            >
                                {getFirstLetter(user?.nama)}
                            </div>

                        )}

                    </div>
                    <div className="flex flex-col align-middle justify-center w-full">
                        <div className="text-2xl font-semibold">{user?.nama}</div>
                        <div className="">{user?.badge_level}</div>
                        <div className="grid grid-cols-3 w-full mt-4 gap-4">
                            <div className="rounded-xl bg-[#F6F7FB] p-5">
                                <p>Saldo Kamu : </p>
                                <p className="text-lg font-medium">{formatRupiah(user?.komisi)}</p>
                            </div>
                            <div className="rounded-xl bg-[#F6F7FB] p-5">
                                <p>Poin Reward Terkumpul : </p>
                                <p className="text-lg font-medium">{user?.poin_reward}</p>
                            </div>
                            <div className="rounded-xl bg-[#F6F7FB] p-5">
                                <p>Total Barang Terjual : </p>
                                <p className="text-lg font-medium">{user?.jml_barang_terjual}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-1 border-[#220593] rounded-3xl p-8">
                    <div className="text-2xl font-semibold mb-6">Informasi Personal</div>
                        <div className="grid grid-cols-2  grid-rows-2 gap-5">
                            <div className="">
                                <label className="block mb-2 font-medium">Nama Lengkap</label>
                                <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                    {user?.nama}
                                </div>
                            </div>
                            <div className="">
                            <label className="block mb-2 font-medium">NIK</label>
                                <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                    {user?.no_ktp}
                                </div>  
                            </div>
                            <div className="">
                                <label className="block mb-2 font-medium">Nomor Telepon</label>
                                <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                    +62{user?.no_telepon || '-'}
                                </div>
                            </div>
                            <div className="">
                                <label className="block mb-2 font-medium">Email</label>
                                <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                    {user?.email}
                                </div>
                            </div>

                        </div>
                </div>
            </div>
        </div>
    )
}