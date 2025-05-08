'use client';

import { useEffect, useRef, useState } from 'react';
import WithRole from '@/components/WithRole/WithRole';

export default function AdminPegawaiPage() {
    const [pegawaiList, setPegawaiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);


    const [showEditSidebar, setShowEditSidebar] = useState(false);

    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        no_telepon: '',
        tanggal_lahir: '',
        komisi: '',
        nama_jabatan: '',
        password: '',
        id_jabatan: ''
      });
      


    useEffect(() => {
        const fetchPegawai = async () => {
            try {
                const res = await fetch(`/api/pegawai?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (res.ok) {
                    setPegawaiList(data.pegawai);
                } else {
                    setError(data.error || 'Gagal mengambil data pegawai');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchPegawai();
    }, [searchQuery]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    const handleEdit = (pegawai) => {
        setEditData(pegawai);
        setShowEditSidebar(true);
    };

    
    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/pegawai', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData)
        });

        if (res.ok) {
            setPegawaiList(prev => prev.map(pegawai => pegawai.id_pegawai === editData.id_pegawai ? editData : pegawai));
            setShowEditSidebar(false);
            alert('Data berhasil diperbarui');
        } else {
            alert('Gagal memperbarui data');
            
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editData) {
            setEditData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = document.cookie.split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        const res = await fetch('/api/pegawai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            setPegawaiList(prev => [...prev, { ...formData, id_pegawai: data.id_pegawai }]);
            setShowModal(false);
            setFormData({ nama: '', email: '', no_telepon: '', tanggal_lahir: '', komisi: '', nama_jabatan: '' });
            alert('Pegawai berhasil ditambahkan');
        } else {
            alert(data.error || 'Gagal menambahkan pegawai');
        }
    };

    const handleDelete = async (id_pegawai) => {
        const confirm = window.confirm('Apakah Anda yakin ingin menghapus data ini?');
        if (!confirm) return;

        const res = await fetch('/api/pegawai', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_pegawai })
        });

        if (res.ok) {
            setPegawaiList(prev => prev.filter(pegawai => pegawai.id_pegawai !== id_pegawai));
            alert('Data berhasil dihapus');
        } else {
            alert('Gagal menghapus data');
        }
    };

    return (
        <div className="p-6">
            <WithRole allowed={["Admin"]}>
                <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Pegawai</h1>
                <input
                    type="text"
                    placeholder="Cari nama/email/jabatan..."
                    className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={() => setShowModal(true)}
                    className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Tambah Pegawai
                </button>



                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Telepon</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tanggal Lahir</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Komisi</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Jabatan</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {pegawaiList.map((pegawai) => (
                                <tr key={pegawai.id_pegawai} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pegawai.id_pegawai}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pegawai.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">+62{pegawai.no_telepon}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(pegawai.tanggal_lahir)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rp{parseInt(pegawai.komisi || 0).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pegawai.nama_jabatan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                        <div className="relative" ref={dropdownRef}>
                                            <button onClick={() => setActiveDropdown(activeDropdown === pegawai.id_pegawai ? null : pegawai.id_pegawai)} className="text-gray-400 hover:text-indigo-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                                                </svg>
                                            </button>
                                            {activeDropdown === pegawai.id_pegawai && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                                                    <button className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => handleEdit(pegawai)}>Edit</button>
                                                    <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={() => handleDelete(pegawai.id_pegawai)}>Hapus</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {showModal && (
                    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                            <h2 className="text-lg font-bold mb-4">Tambah Pegawai</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input name="nama" onChange={handleChange} value={formData.nama} className="w-full border px-3 py-2 rounded" placeholder="Nama" />
                                <input name="email" onChange={handleChange} value={formData.email} className="w-full border px-3 py-2 rounded" placeholder="Email" />
                                <input name="no_telepon" onChange={handleChange} value={formData.no_telepon} className="w-full border px-3 py-2 rounded" placeholder="No. Telepon" />
                                <input name="tanggal_lahir" onChange={handleChange} value={formData.tanggal_lahir} className="w-full border px-3 py-2 rounded" placeholder="Tgl. Lahir" />
                                <input name="password" onChange={handleChange} value={formData.password} className="w-full border px-3 py-2 rounded" placeholder="Password" type="password" />
                                <input name="komisi" onChange={handleChange} value={formData.komisi} className="w-full border px-3 py-2 rounded" placeholder="Komisi" />
                                <input name="nama_jabatan" onChange={handleChange} value={formData.nama_jabatan} className="w-full border px-3 py-2 rounded" placeholder="Jabatan" />
                                <input name="id_jabatan" onChange={handleChange} value={formData.id_jabatan} className="w-full border px-3 py-2 rounded" placeholder="ID Jabatan" />
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditSidebar && editData && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowEditSidebar(false)} />
                        <div className="fixed inset-y-0 right-0 z-50 bg-white w-full max-w-md h-full p-6 shadow-xl transition-transform duration-300">
                            <h2 className="text-lg font-bold mb-4">Edit Pegawai</h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <input name="nama" onChange={handleChange} value={editData.nama} className="w-full border px-3 py-2 rounded" placeholder="Nama" />
                                <input name="email" onChange={handleChange} value={editData.email} className="w-full border px-3 py-2 rounded" placeholder="Email" />
                                <input name="no_telepon" onChange={handleChange} value={editData.no_telepon} className="w-full border px-3 py-2 rounded" placeholder="No. Telepon" />
                                <input name="tanggal_lahir" onChange={handleChange} value={editData.tanggal_lahir} className="w-full border px-3 py-2 rounded" placeholder="Tgl. Lahir" />
                                <input name="komisi" onChange={handleChange} value={editData.komisi} className="w-full border px-3 py-2 rounded" placeholder="Komisi" />
                                <input name="id_jabatan" onChange={handleChange}value={editData.id_jabatan} className="w-full border px-3 py-2 rounded" placeholder="ID Jabatan"/>
                                <input name="nama_jabatan" onChange={handleChange} value={editData.nama_jabatan} className="w-full border px-3 py-2 rounded" placeholder="Jabatan" />
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowEditSidebar(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </WithRole>
        </div>
    );
}