'use client';

import { useEffect, useState } from 'react';
import RippleButton from '@/components/RippleButton/RippleButton';
import ReuseButton from '@/components/ReuseButton/ReuseButton';
import { useParams } from 'next/navigation';

export default function DetailBarangPage() {
    const { id_barang } = useParams();
    const [barang, setBarang] = useState(null);
    const [previewImg, setPreviewImg] = useState('');

    useEffect(() => {
        const fetchBarang = async () => {
            const res = await fetch(`/api/barang/${id_barang}`);
            const data = await res.json();
            setBarang(data.barang);
            if (data.barang.gambar_barang.length > 0) {
                setPreviewImg(data.barang.gambar_barang[0].src_img);
            }
        };
        fetchBarang();
    }, [id_barang]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!barang) return <div>Loading...</div>;

    return (
        <div className="px-6 md:px-20 mt-24">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <img
                            src={previewImg || '/images/default-image.jpg'}
                            alt={barang.nama_barang}
                            className="w-full h-[400px] object-cover rounded-2xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        {barang.gambar_barang.map((gambar) => (
                            <img
                                key={gambar.id_gambar}
                                src={gambar.src_img}
                                alt="Thumbnail"
                                onClick={() => setPreviewImg(gambar.src_img)}
                                className={`w-16 h-16 object-cover rounded-xl cursor-pointer ${
                                    previewImg === gambar.src_img ? 'ring-2 ring-blue-600' : ''
                                }`}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-3">{barang.nama_barang}</h1>
                    <p className="text-2xl font-semibold mb-4">{formatPrice(barang.harga_barang)}</p>
                    <div className="flex gap-4 mb-4">
                        <RippleButton className="text-white px-6 py-2 w-full rounded-4xl bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0%,_#26C2FF_0%,_#220593_90%)]">
                            Beli Sekarang
                        </RippleButton>
                        <ReuseButton>
                            <div className="text-black px-4 py-2 rounded-full hover:text-white">+</div>
                        </ReuseButton>
                    </div>
                    <p className="mt-4">{barang.deskripsi_barang}</p>
                    <p className="text-sm">Status Garansi: {barang.status_garansi}</p>
                </div>
            </div>
        </div>
    );
}
