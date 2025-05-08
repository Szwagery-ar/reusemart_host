'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';

export default function Belanja() {
    const [barang, setBarang] = useState([]);

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const response = await fetch('/api/barang');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setBarang(data.barang);
            } catch (error) {
                console.error('Error fetching barang:', error);
            }
        };

        fetchBarang();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div>
            <div className="px-6 md:px-20 mt-24">
                <img
                    src="/images/Home/promo 1.png"
                    alt="Banner Promo"
                    className="rounded-3xl w-full max-h-[300px] object-cover"
                />

                <h2 className="text-2xl font-bold mt-10 mb-6">Produk Tersedia</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {barang.map((item) => (
                        <Link
                            key={item.id_barang}
                            href={`/belanja/${item.id_barang}`}
                            className=""
                        >
                            <img
                                src={
                                    item.gambar_barang && item.gambar_barang.length > 0
                                        ? item.gambar_barang[0].src_img
                                        : '/images/default-image.jpg'
                                }
                                alt={item.nama_barang}
                                className="w-full h-65 object-cover rounded-4xl mb-3 bg-gray-100"
                            />
                            <div className="text-base font-medium text-gray-900 truncate mb-2">
                                {item.nama_barang}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                {formatPrice(item.harga_barang)}
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
