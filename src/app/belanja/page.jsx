"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Belanja() {
    const [barang, setBarang] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [selectedSort, setSelectedSort] = useState("Paling Baru");
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const response = await fetch(
                    `/api/barang?q=${encodeURIComponent(searchQuery)}`
                );
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setBarang(data.barang);
            } catch (error) {
                console.error("Error fetching barang:", error);
            }
        };

        const fetchKategori = async () => {
            try {
                const response = await fetch("/api/kategoribarang");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setKategoriList(data.kategoriBarang);
            } catch (error) {
                console.error("Error fetching kategori:", error);
            }
        };

        fetchBarang();
        fetchKategori();
    }, [searchQuery]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleFilterClick = (category) => {
        setSelectedFilters((prevFilters) =>
            prevFilters.includes(category)
                ? prevFilters.filter((filter) => filter !== category)
                : [...prevFilters, category]
        );
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

        const kategoriList = Array.isArray(item.kategori_barang)
            ? item.kategori_barang
            : item.kategori_barang
                ? [item.kategori_barang]
                : [];

        console.log("Filtering for categories: ", selectedFilters);
        console.log("Item categories: ", kategoriList);

        return selectedFilters.some((filter) => kategoriList.includes(filter));
    });

    const sortedBarang = [...filteredBarang].sort((a, b) => {
        if (selectedSort === "Harga Terendah") {
            return a.harga_barang - b.harga_barang;
        } else if (selectedSort === "Harga Tertinggi") {
            return b.harga_barang - a.harga_barang; // ini sort harga tertinggi
        } else if (selectedSort === "Paling Baru") {
            const dateA = new Date(a.tanggal_masuk);
            const dateB = new Date(b.tanggal_masuk);
            return dateB - dateA;
        } else {
            const dateA = new Date(a.tanggal_masuk);
            const dateB = new Date(b.tanggal_masuk);
            return dateA - dateB;
        }
    });

    return (
        <div>
            <div className="px-6 md:px-20 mt-24">
                <img
                    src="/images/Home/promo-1.png"
                    alt="Banner Promo"
                    className="rounded-3xl w-full max-h-[300px] object-cover"
                />

                <div className="flex items-center justify-between flex-wrap mt-6 mb-6">
                    <div className="flex gap-1 items-center">
                        <button
                            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                            className="bg-[radial-gradient(ellipse_130.87%_130.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white p-2 rounded-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                                />
                            </svg>
                        </button>

                        {selectedFilters.length > 0 && (
                            <button
                                className="text-indigo-700 font-bold text-sm py-2 px-4 rounded-full cursor-pointer"
                                onClick={() => setSelectedFilters([])}
                            >
                                Hapus Filter
                            </button>
                        )}

                        {/* <div className="flex gap-2 overflow-x-auto max-w-115 hide-scrollbar">
                            {selectedFilters.map((filter, index) => (
                                <div
                                    key={index}
                                    className="bg-blue-100 text-blue-600 text-sm px-4 py-2 rounded-full flex items-center gap-2 shrink-0"
                                >
                                    <span>{filter}</span>
                                    <button
                                        onClick={() => handleRemoveFilter(filter)}
                                        className="text-xl leading-none cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div> */}

                        {/* new kategori list adjustment */}
                        {Array.isArray(selectedFilters) && selectedFilters.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto max-w-115 hide-scrollbar">
                                {selectedFilters.map((filter, index) => (
                                    <div
                                        key={index}
                                        className="bg-blue-100 text-blue-600 text-sm px-4 py-2 rounded-full flex items-center gap-2 shrink-0"
                                    >
                                        <span>{filter}</span>
                                        <button
                                            onClick={() => handleRemoveFilter(filter)}
                                            className="text-xl leading-none cursor-pointer"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                    <div className="flex gap-2">
                        <div className="relative inline-block">
                            <span className="text-lg font-medium">Urutkan:</span>
                            <select
                                id="sort"
                                value={selectedSort}
                                onChange={handleSortChange}
                                className="ml-4 py-2 px-4 border rounded-full"
                            >
                                <option value="Paling Baru">Paling Baru</option>
                                <option value="Harga Terendah">Harga Terendah</option>
                                <option value="Harga Tertinggi">Harga Tertinggi</option>
                            </select>
                        </div>

                        <div className="w-100">
                            <input
                                type="text"
                                placeholder="Cari apa hari ini?"
                                className="px-4 py-2 border border-indigo-500 rounded-full w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-rows-2 gap-5">
                    {showCategoryFilter && (
                        <div className="w-60 h-100 bg-[#EEF1FF] p-7 rounded-3xl">
                            <div className="flex flex-col gap-3">
                                {kategoriList.map((kategori) => {
                                    const isChecked = selectedFilters.includes(
                                        kategori.nama_kategori
                                    );

                                    return (
                                        <label
                                            key={kategori.id_kategori}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    onChange={() =>
                                                        handleFilterClick(kategori.nama_kategori)
                                                    }
                                                    checked={isChecked}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-5 h-5 rounded-sm border-2 border-black flex items-center justify-center transition p-1
                            ${isChecked
                                                            ? "bg-[radial-gradient(ellipse_130.87%_130.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)] border-none"
                                                            : "border-black bg-white"
                                                        }`}
                                                >
                                                    {isChecked && (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 448 512"
                                                            fill="white"
                                                        >
                                                            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="truncate text-sm text-gray-800">
                                                {kategori.nama_kategori}
                                            </span>
                                        </label>
                                    );
                                })}

                                {selectedFilters.length > 0 && (
                                    <div
                                        onClick={() => setSelectedFilters([])}
                                        className="underline text-sm cursor-pointer mt-1 font-semibold"
                                    >
                                        Hapus Semua Filter
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div
                        className={`grid ${showCategoryFilter ? "grid-cols-4" : "grid-cols-5"
                            } gap-3`}
                    >
                        {sortedBarang.map((item) => (
                            <Link
                                key={item.id_barang}
                                href={`/belanja/${item.id_barang}`}
                                className="rounded-2xl"
                            >
                                <img
                                    src={
                                        item.gambar_barang && item.gambar_barang.length > 0
                                            ? item.gambar_barang[0].src_img
                                            : "/images/default-image.jpg"
                                    }
                                    alt={item.nama_barang}
                                    className="w-full h-65 object-cover rounded-4xl mb-3 bg-gray-100"
                                />
                                <div className="px-2">
                                    <div className="text-base font-medium text-gray-900 truncate mb-2">
                                        {item.nama_barang}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        {formatPrice(item.harga_barang)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
