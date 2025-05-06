'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ReuseButton from '@/components/ReuseButton/ReuseButton';
import RippleButton from '@/components/RippleButton/RippleButton';
import ReduseButton from '@/components/ReduseButton/ReduseButton';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [alamatToDelete, setAlamatToDelete] = useState(null);


    const [alamatList, setAlamatList] = useState([]);
    const [formAlamat, setFormAlamat] = useState({
        id_alamat: null,
        nama_alamat: '',
        lokasi: '',
        note: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [selectedAlamat, setSelectedAlamat] = useState(null);
    const [alamatLoading, setAlamatLoading] = useState(false);


    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        nama: user?.nama || '',
        no_telepon: user?.no_telepon || '',
        email: user?.email || '',
    });



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

    // PROFILE
    const editProfile = async () => {
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);  // Memperbarui data user setelah berhasil
                setIsEditingProfile(false);
            } else {
                console.error('Gagal memperbarui profil');
            }
        } catch (err) {
            console.error('Terjadi kesalahan:', err);
        }
    };
    // PROFILE

    // ALAMAT
    const fetchAlamat = async () => {
        try {
            setAlamatLoading(true);

            const res = await fetch('/api/alamat');
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Gagal mengambil alamat:", errorData.error || res.status);
                return;
            }

            const data = await res.json();
            setAlamatList(data.alamat || []);
        } catch (err) {
            console.error("Gagal mengambil alamat:", err);
        } finally {
            setAlamatLoading(false);
        }
    };
    useEffect(() => {
        if (!user) return;
        fetchAlamat();
    }, [user])

    const tambahAlamat = async () => {
        const res = await fetch('/api/alamat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formAlamat),
        });

        if (res.ok) {
            fetchAlamat();
            setShowModal(false);
            setFormAlamat({ nama_alamat: '', lokasi: '', note: '' });
        }
    };

    const editAlamat = async ({ id_alamat, nama_alamat, lokasi, note }) => {
        const res = await fetch('/api/alamat', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_alamat, nama_alamat, lokasi, note }),
        });
        if (res.ok) {
            fetchAlamat();
            setIsEditing(false);
            setFormAlamat({ id_alamat: null, nama_alamat: '', lokasi: '', note: '' });
        }
    };

    const hapusAlamat = async (id_alamat) => {
        console.log("Deleting alamat ID:", id_alamat);
        const res = await fetch('/api/alamat', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_alamat }),
        });


        if (res.ok) fetchAlamat();
    };
    // ALAMAT


    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen">{error}</div>;
    }

    const getFirstLetter = (name) => {
        return name ? name.charAt(0).toUpperCase() : '';

    }

    const generateStableColor = (input) => {
        const colors = ['#EF4444', '#F97316', '#10B981', '#8B5CF6', '#EAB308']; // merah, oranye, hijau, biru, kuning
        if (!input) return colors[0]; // fallback

        const charCode = input.charCodeAt(0); // ASCII huruf pertama
        const index = charCode % colors.length;
        return colors[index];
    };

    return (
        <div className="">


            <div className="rounded-4xl flex w-full text-black font-medium">
                <div className="flex flex-col w-full rounded-4xl">
                    <div className="flex mb-6 gap-5">
                        <div className="ps-7">
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
                                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
                                    style={{ backgroundColor: generateStableColor(user?.nama || user?.email) }}
                                >
                                    {getFirstLetter(user?.nama)}
                                </div>

                            )}

                        </div>
                        <div className="flex flex-col align-middle justify-center">
                            <div className="text-2xl font-semibold">{user?.nama}</div>
                            <div className="font-extralight">{user?.email}</div>
                            <div className="text-indigo-800 font-semibold">{user?.poin_loyalitas ?? 0} Reusepoint</div>
                        </div>
                    </div>

                    <div className="border-1 border-[#220593] rounded-3xl p-6">
                        <div className="text-2xl font-bold mb-6">Informasi Personal</div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="mb-6">
                                    <label className="block mb-2 font-medium">Nama Lengkap</label>
                                    <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                        {user?.nama}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block mb-2 font-medium">Nomor Telepon</label>
                                    <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                        +62{user?.no_telepon || '-'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-14">
                                    <label className="block mb-2 font-medium">Email</label>
                                    <div className="border border-[#220593] rounded-full px-5 py-3 font-semibold text-black">
                                        {user?.email}
                                    </div>
                                </div>


                                <div className="col-span-2">
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <RippleButton
                                            type="button"
                                            onClick={() => setIsEditingProfile(true)}
                                            className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-full font-semibold bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]"
                                        >
                                            Ubah Profil
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>

                                        </RippleButton>

                                        <ReuseButton className="w-full">
                                            <div className="flex items-center justify-center gap-2 py-3">
                                                <span className="text-indigo-900 group-hover:text-white font-semibold transition-colors duration-300">
                                                    Ganti Password
                                                </span>
                                                <svg className="w-5 h-5 text-indigo-900 group-hover:text-white transition-colors duration-300" /* icon */ />
                                            </div>
                                        </ReuseButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isEditingProfile && (
                            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                                    <h2 className="text-xl font-bold mb-4">Edit Profil</h2>

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            editProfile();
                                        }}
                                        className="flex flex-col gap-4"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Nama Lengkap"
                                            value={editForm.nama}
                                            onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                                            className="border border-gray-300 px-4 py-2 rounded"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Nomor Telepon"
                                            value={editForm.no_telepon}
                                            onChange={(e) => setEditForm({ ...editForm, no_telepon: e.target.value })}
                                            className="border border-gray-300 px-4 py-2 rounded"
                                            required
                                        />

                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="border border-gray-300 px-4 py-2 rounded"
                                            required
                                        />

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(false)}
                                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                            >
                                                Simpan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>



                    <div className="mt-4 border-1 border-[#220593] rounded-3xl p-6">
                        <div className="text-2xl font-bold mb-6">Alamat Tersimpan</div>
                        <div className="overflow-x-auto mb-6 hide-scrollbar">
                            <div className="flex flex-row gap-4">
                                {alamatList.length === 0 ? (
                                    <div className="text-center text-gray-500 font-medium py-6">
                                        Alamat belum ada.
                                    </div>
                                ) : (
                                    alamatList.map((alamat) => (
                                        <div key={alamat.id_alamat} className="p-8 bg-[#F6F7FB] rounded-3xl text-wrap w-70 min-w-[280px] max-w-[320px] flex-shrink-0">
                                            <div className="text-lg font-semibold mb-3 truncate max-w-full">{alamat.nama_alamat}</div>
                                            <div className="text-sm font-extralight mb-3 line-clamp-4 break-words max-w-full">{alamat.lokasi}</div>
                                            <div className="text-sm font-semibold truncate max-w-full">"{alamat.note}"</div>
                                            <div className="flex justify-between mt-4">
                                                <ReuseButton onClick={() => {
                                                    setFormAlamat({
                                                        id_alamat: alamat.id_alamat,
                                                        nama_alamat: alamat.nama_alamat,
                                                        lokasi: alamat.lokasi,
                                                        note: alamat.note,
                                                    });
                                                    setIsEditing(true);
                                                    setShowModal(true);
                                                }}>
                                                    <div className="px-3 py-1 flex items-center gap-2">Edit
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                    </div>
                                                </ReuseButton>
                                                <ReduseButton onClick={() => {
                                                    setAlamatToDelete(alamat);
                                                    setShowDeleteModal(true);
                                                }}
                                                >
                                                    <div className="px-3 py-1 flex items-center">Hapus
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>

                                                    </div>
                                                </ReduseButton>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {showDeleteModal && (
                                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                                        <h2 className="text-xl font-bold mb-4 text-center text-red-700">Konfirmasi Hapus</h2>
                                        <p className="text-gray-700 mb-6 text-center">
                                            Apakah kamu yakin ingin menghapus alamat <strong>{alamatToDelete?.nama_alamat}</strong>?
                                        </p>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setShowDeleteModal(false)}
                                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await hapusAlamat(alamatToDelete.id_alamat);
                                                    setShowDeleteModal(false);
                                                    setAlamatToDelete(null);
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ReuseButton className='w-full' onClick={() => setShowModal(true)}>
                            <div className="py-3 font-semibold">
                                Tambah ALamat
                            </div>
                        </ReuseButton>
                        {showModal && (
                            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                                    <h2 className="text-xl font-bold mb-4">Tambah Alamat</h2>

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (isEditing) {
                                                editAlamat(formAlamat);
                                            } else {
                                                tambahAlamat(formAlamat);
                                            }
                                            setShowModal(false);
                                            setIsEditing(false);
                                            setFormAlamat({ id_alamat: null, nama_alamat: '', lokasi: '', note: '' });
                                        }}
                                        className="flex flex-col gap-4"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Nama Alamat"
                                            value={formAlamat.nama_alamat}
                                            onChange={(e) => setFormAlamat({ ...formAlamat, nama_alamat: e.target.value })}
                                            className="border border-gray-300 px-4 py-2 rounded"
                                            required
                                        />

                                        <textarea
                                            placeholder="Lokasi Lengkap"
                                            value={formAlamat.lokasi}
                                            onChange={(e) => setFormAlamat({ ...formAlamat, lokasi: e.target.value })}
                                            className="border border-gray-300 px-4 py-2 rounded"
                                            required
                                        />

                                        <input
                                            type="text"
                                            placeholder="Catatan (Opsional)"
                                            value={formAlamat.note}
                                            onChange={(e) => setFormAlamat({ ...formAlamat, note: e.target.value })}
                                            className="border border-gray-300 px-4 py-2 rounded"
                                        />

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                            >
                                                {isEditing ? 'Simpan' : 'Tambah'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
