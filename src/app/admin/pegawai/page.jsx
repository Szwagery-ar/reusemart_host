'use client';

import { useEffect, useState } from 'react';

export default function AdminPegawaiPage() {
    const [pegawaiList, setPegawaiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Pegawai</h1>
            <input
                type="text"
                placeholder="Cari nama/email/jabatan..."
                className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pegawai.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pegawai.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">+62{pegawai.no_telepon}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(pegawai.tanggal_lahir)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rp{parseInt(pegawai.komisi || 0).toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pegawai.nama_jabatan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}