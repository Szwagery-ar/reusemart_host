'use client';

import { useEffect, useState } from 'react';

export default function AdminMerchandisePage() {
  const [merchandiseList, setMerchandiseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchMerchandise();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Merchandise</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merchandiseList.map((item) => (
          <div key={item.id_merchandise} className="border p-4 rounded-lg shadow-sm bg-white">
            {item.src_img ? (
              <img
                src={item.src_img}
                alt={item.nama_merch}
                className="w-full h-48 object-cover rounded"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                Tidak ada gambar
              </div>
            )}
            <h2 className="text-lg font-semibold mt-2">{item.nama_merch}</h2>
            <p className="text-sm text-gray-600">{item.deskripsi_merch}</p>
            <p className="text-sm text-gray-600 mt-1">Stok: {item.jumlah_stok}</p>
            <p className="text-sm text-gray-600">Poin: {item.jumlah_poin}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
