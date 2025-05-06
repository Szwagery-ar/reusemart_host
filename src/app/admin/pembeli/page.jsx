'use client';

import { useEffect, useState } from 'react';

export default function AdminPembeliPage() {
    const [pembeliList, setPembeliList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPembeli = async () => {
            try {
                const res = await fetch(`/api/pembeli?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (res.ok) {
                    setPembeliList(data.pembeli);
                } else if (res.status === 403) {
                    setError("Anda tidak memiliki akses ke halaman ini.");
                } else {
                    setError(data.error || 'Gagal mengambil data penitip');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchPembeli();
    }, [searchQuery]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Pembeli</h1>
            <input
                type="text"
                placeholder="Cari nama/email/telepon..."
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
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Poin</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Alamat</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Lokasi</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {pembeliList.map((pembeli, index) => (
                            <tr key={`${pembeli.id_pembeli}-${index}`} className="hover:bg-gray-50">

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pembeli.id_pembeli}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pembeli.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pembeli.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">+62{pembeli.no_telepon}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pembeli.poin_loyalitas}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pembeli.nama_alamat || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pembeli.lokasi || '-'}</td>

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
