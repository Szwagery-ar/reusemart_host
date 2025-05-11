'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ReuseButton from '@/components/ReuseButton/ReuseButton';
import ReduseButton from '@/components/ReduseButton/ReduseButton';


export default function TukarPoin() {
    const [user, setUser] = useState(null);
    const [poin, setPoin] = useState(0);
    const [klaim, setKlaim] = useState([]);
    const [merchandiseList, setMerchandiseList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [jumlahTukar, setJumlahTukar] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKlaim, setSelectedKlaim] = useState(null);

    const openModal = (id_klaim) => {
        setSelectedKlaim(id_klaim);
        setIsModalOpen(true);
        document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedKlaim(null);
        document.body.style.overflow = "auto";
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        setError('Gagal mengambil data pengguna');
                        router.push('/login');
                    }
                } else {
                    setError('Gagal mengambil data pengguna');
                    if (res.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const fetchTukarPoin = async () => {
        try {
            const res = await fetch(`/api/merchandise/tukarpoin`);
            const data = await res.json();
            if (res.ok) {
                setPoin(data.poin_loyalitas);
                setKlaim(data.klaim);
            } else {
                setError(data.error || 'Gagal mengambil data klaim merchandise');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mengambil data klaim');
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchandise = async () => {
        try {
            const res = await fetch('/api/merchandise');
            const data = await res.json();
            if (res.ok) {
                setMerchandiseList(data.merchandise);
            } else {
                setError(data.error || 'Gagal mengambil data merchandise');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mengambil data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTukarPoin();
    }, []);

    useEffect(() => {
        fetchMerchandise();
    }, []);

    const handleTukar = async (item) => {
        const jumlah = jumlahTukar[item.id_merchandise] || 0;
        if (jumlah === 0) return;

        try {
            const res = await fetch('/api/klaim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id_merchandise: item.id_merchandise,
                    jml_merch_diklaim: jumlah,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                setJumlahTukar((prev) => ({ ...prev, [item.id_merchandise]: 0 }));
                await Promise.all([fetchTukarPoin(), fetchMerchandise()]);
                alert('Berhasil menukar merchandise!');
            } else {
                const err = await res.json();
                console.error("RESPON GAGAL:", err);
                alert(err.error || err.message || 'Gagal menukar merchandise');
            }
        } catch (err) {
            console.error('Terjadi error saat fetch klaim:', err);
            alert('Terjadi kesalahan saat menukar merchandise');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }


    const handleDelete = async () => {
        if (!selectedKlaim) return;
        try {
            const response = await fetch('/api/klaim', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_klaim: selectedKlaim }),
            });

            const data = await response.json();

            if (response.ok) {
                setKlaim(klaim.filter((item) => item.id_klaim !== selectedKlaim));
                toast.success('Klaim merch berhasil dihapus!', {
                    position: "bottom-right",
                    autoClose: 3000,
                });
            } else {
                toast.error(data.error || 'Failed to delete klaim', {
                    position: "bottom-right",
                    autoClose: 3000,
                });
            }
            closeModal();  // Tutup modal setelah berhasil
        } catch (error) {
            console.error('Error deleting klaim:', error);
            toast.error('Gagal menghapus klaim', {
                position: "bottom-right",
                autoClose: 3000,
            });
        }
    };


    const handleJumlahChange = (id, delta, stok) => {
        setJumlahTukar((prev) => {
            const current = prev[id] || 0;
            const newJumlah = Math.max(0, Math.min(current + delta, stok));
            return { ...prev, [id]: newJumlah };
        });
    };


    return (
        <div className="space-y-4">
            {/* Kartu Poin */}
            <div className="mb-4 border border-[#220593] p-6 rounded-4xl">
                <div className="text-lg font-semibold">Poin Anda</div>
                <div className="text-3xl text-[#220593] font-semibold">{user?.poin_loyalitas} Reusepoint</div>
            </div>

            {/* Kartu Klaim */}
            <div className="border border-[#220593] p-6 rounded-4xl">
                <div className="text-xl font-semibold mb-1">Pesanan Merch Kamu</div>
                <div className="text-xs font-semibold mb-4">Ambil merchandise kamu di kantor kami ya!</div>

                <div className="space-y-4">
                    {klaim.length === 0 ? (
                        <div className="text-center text-gray-500 italic text-4xl p-8">Belum tukar merch? Tukarkan sekarang</div>
                    ) : (
                        klaim.map((item) => (
                            <div key={item.id_klaim} className="flex justify-between items-center border p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-4">
                                    <img src={item.src_img || "/placeholder.png"} alt="Merch" className="w-14 h-14 bg-gray-200 rounded-lg object-cover" />
                                    <div>
                                        <div className="font-bold">{item.nama_merch}</div>
                                        <div className="text-sm">x {item.jml_merch_diklaim}</div>
                                        <div className="text-sm">
                                            {item.total_poin / item.jml_merch_diklaim} Reusepoint
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-sm mb-2">
                                        Total poin ditukar: {item.total_poin} Reusepoint
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <ReuseButton>
                                            <div className="px-5 py-1 text-xs font-semibold">
                                                Edit
                                            </div>
                                        </ReuseButton>
                                        <ReduseButton onClick={() => openModal(item.id_klaim)}>
                                            <div className="px-5 py-1 text-xs font-semibold">
                                                Hapus
                                            </div>
                                        </ReduseButton>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-100">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus Klaim</h3>
                            <p className="mb-4">Apakah Anda yakin ingin menghapus klaim ini?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleDelete}
                                    className="px-5 py-2 bg-red-500 text-white rounded-lg"
                                >
                                    Hapus
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2 bg-gray-300 text-black rounded-lg"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Daftar Merchandise */}
            <div className="border border-[#220593] p-6 rounded-4xl">
                <h2 className="text-xl font-semibold mb-1">Merchandise Tersedia</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Kumpulkan Reusepoint dari setiap transaksi dan tukarkan dengan merchandise menarik.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {merchandiseList.map((item) => (

                        <div
                            key={item.id_merchandise}
                            className="flex items-center justify-between p-4 border rounded-2xl shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-lg" />
                                <div className=''>
                                    <div className="font-bold text-sm ">{item.nama_merch}</div>
                                    <div className="text-sm">{item.jumlah_poin} Reusepoint</div>
                                    <div className="text-sm text-gray-600">
                                        Stok tersedia: {item.jumlah_stok}
                                    </div>
                                </div>
                            </div>

                            <div className="">
                                <div className="text-sm font-semibold mb-1 text-right">
                                    Poin ditukar: {(jumlahTukar[item.id_merchandise] || 0) * item.jumlah_poin}
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            className="text-xl text-[#220593] border border-[#220593] rounded-full w-6 h-6 flex items-center justify-center"
                                            onClick={() => handleJumlahChange(item.id_merchandise, -1, item.jumlah_stok)}
                                        >
                                            -
                                        </button>
                                        <input
                                            readOnly
                                            value={jumlahTukar[item.id_merchandise] || 0}
                                            className="w-10 text-center border-b-1 px-1 py-0.5 text-sm border-[#220593]"
                                        />
                                        <button
                                            className="text-xl text-[#220593] border border-[#220593] rounded-full w-6 h-6 flex items-center justify-center"
                                            onClick={() => handleJumlahChange(item.id_merchandise, 1, item.jumlah_stok)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <ReuseButton onClick={() => handleTukar(item)}>
                                        <div className="px-4 py-1 text-xs">Tukar</div>
                                    </ReuseButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
