'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DetailTransaksiPenitipan() {
  const { id_penitipan } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/transaksi-penitipan/penitipan/${id_penitipan}`);
        const json = await res.json();
        setData(json.transaksi);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    if (id_penitipan) {
      fetchDetail();
    }
  }, [id_penitipan]);

  if (!data) return <div className="p-6">Memuat data transaksi...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detail Transaksi Penitipan #{data.id_transaksi_penitipan}</h1>
      <p><strong>Nama Penitip:</strong> {data.penitip_name}</p>
      <p><strong>Tanggal Masuk:</strong> {data.tanggal_masuk?.split('T')[0]}</p>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-3">Daftar Barang Titipan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.barang.map((item) => (
          <div key={item.id_barang} className="border rounded shadow-sm p-4 bg-white">
            <img
              src={item.gambar_barang?.[0]?.src_img || "/images/default.jpg"}
              className="w-full h-32 object-cover mb-2 rounded"
              alt="Gambar Barang"
            />
            <h3 className="font-semibold text-lg">{item.nama_barang}</h3>
            <p><strong>Kode Produk:</strong> {item.kode_produk}</p>
            <p><strong>Harga:</strong> Rp{parseInt(item.harga_barang).toLocaleString()}</p>
            <p><strong>Status:</strong> {item.status_barang}</p>
            <p><strong>Kategori:</strong> {item.kategori?.join(", ") || '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
