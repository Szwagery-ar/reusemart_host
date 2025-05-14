'use client';

import { useEffect, useState } from "react";
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';

export default function Belanja() {
    const [barang, setBarang] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [selectedSort, setSelectedSort] = useState('Paling Baru');
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);

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

        const fetchKategori = async () => {
            try {
                const response = await fetch('/api/kategoribarang');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setKategoriList(data.kategoriBarang);
            } catch (error) {
                console.error('Error fetching kategori:', error);
            }
        };

        fetchBarang();
        fetchKategori();
    }, []);


    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleFilterClick = (category) => {
        if (!selectedFilters.includes(category)) {
            setSelectedFilters((prevFilters) => [...prevFilters, category]);
        }
    };

    const handleRemoveFilter = (category) => {
        setSelectedFilters((prevFilters) =>
            prevFilters.filter((filter) => filter !== category)
        );
    };

    const handleSortChange = (e) => {
        setSelectedSort(e.target.value);
    };

    const filteredBarang = barang.filter((item) => {
        if (selectedFilters.length === 0) return true;

        // Pastikan item.kategori_barang tidak undefined atau null
        const kategoriList = Array.isArray(item.kategori_barang)
            ? item.kategori_barang
            : item.kategori_barang ? [item.kategori_barang] : [];

        console.log("Filtering for categories: ", selectedFilters);
        console.log("Item categories: ", kategoriList);

        return selectedFilters.some((filter) =>
            kategoriList.includes(filter)
        );
    });

    // Ini buat sort                               
    const sortedBarang = [...filteredBarang].sort((a, b) => {
        if (selectedSort === 'Harga Terendah') {
            return a.harga_barang - b.harga_barang; // ini sort harga terendah
        } else if (selectedSort === 'Harga Tertinggi') {
            return b.harga_barang - a.harga_barang; // ini sort harga tertinggi
        } else if (selectedSort === 'Paling Baru') { // ini sort paling baru pakai tanggal_masuk
            const dateA = new Date(a.tanggal_masuk);
            const dateB = new Date(b.tanggal_masuk);
            return dateB - dateA;
        }
        return 0;
    });

    return (
        <div>
            <div className="px-6 md:px-20 mt-24">
                <img
                    src="/images/Home/promo 1.png"
                    alt="Banner Promo"
                    className="rounded-3xl w-full max-h-[300px] object-cover"
                />

                <div className="flex items-center justify-between mt-6 mb-6">
                    <button
                        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                        className="bg-blue-500 text-white py-2 px-4 rounded-full"
                    >
                        {showCategoryFilter ? 'Sembunyikan Filter' : 'Tampilkan Filter Kategori'}
                    </button>

                    <button className="bg-blue-500 text-white py-2 px-4 rounded-full">
                        Hapus Filter
                    </button>

                    {selectedFilters.map((filter, index) => (
                        <div key={index} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full flex items-center gap-2">
                            <span>{filter}</span>
                            <button
                                onClick={() => handleRemoveFilter(filter)}
                                className="text-xl"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <div className="mb-6">
                        <label htmlFor="sort" className="text-lg font-medium">Urutkan:</label>
                        <select
                            id="sort"
                            value={selectedSort}
                            onChange={handleSortChange}
                            className="ml-4 py-2 px-4 border rounded-md"
                        >
                            <option value="Paling Baru">Paling Baru</option>
                            <option value="Harga Terendah">Harga Terendah</option>
                            <option value="Harga Tertinggi">Harga Tertinggi</option>
                        </select>
                    </div>


                </div>

                <div className="flex flex-rows-2 gap-5">
                    {showCategoryFilter && (
                        <div className="w-60 h-100 bg-gray-200 p-4 rounded-xl shadow-md">
                            <div className="flex flex-col gap-2 ">
                                {kategoriList.map((kategori) => (
                                    <div key={kategori.id_kategori} className="flex items-center gap-2 ">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleFilterClick(kategori.nama_kategori)}
                                            checked={selectedFilters.includes(kategori.nama_kategori)}
                                            className="w-4 h-4"
                                        />
                                        <label className="truncate">{kategori.nama_kategori}</label>
                                    </div>
                                ))}
                                <div className="underline cursor-pointer">Hapus Semua Filter</div>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-5">
                        {sortedBarang.map((item) => (
                            <Link
                                key={item.id_barang}
                                href={`/belanja/${item.id_barang}`}
                                className="border rounded-2xl p-4 w-60"
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
        </div>
    );
}
