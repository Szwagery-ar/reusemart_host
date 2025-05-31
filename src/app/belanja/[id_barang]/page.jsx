"use client";

import { useEffect, useState, useCallback } from "react";
import RippleButton from "@/components/RippleButton/RippleButton";
import ReuseButton from "@/components/ReuseButton/ReuseButton";
import { ShoppingCart } from "lucide-react";
import { useRouter, useParams } from "next/navigation";


export default function DetailBarangPage() {
    const router = useRouter();
    const { id_barang } = useParams();
    const [barang, setBarang] = useState(null);
    const [previewImg, setPreviewImg] = useState("");
    const [uniqueImages, setUniqueImages] = useState([]);

    const [diskusi, setDiskusi] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCartPopup, setShowCartPopup] = useState(false);

    const [isExpanded, setIsExpanded] = useState(false);

    const [user, setUser] = useState(null);

    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const [formData, setFormData] = useState({
        isi_diskusi: '',
    });

    useEffect(() => {
        const fetchBarang = async () => {
            const res = await fetch(`/api/barang/${id_barang}`);
            const data = await res.json();
            setBarang(data.barang);
            if (data.barang && data.barang.gambar_barang.length > 0) {
                setPreviewImg(data.barang.gambar_barang[0].src_img);

                const uniqueImgs = Array.from(
                    new Set(data.barang.gambar_barang.map((item) => item.src_img))
                ).map((src_img) =>
                    data.barang.gambar_barang.find((item) => item.src_img === src_img)
                );
                setUniqueImages(uniqueImgs);
            }
        };
        fetchBarang();
    }, [id_barang]);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Error checking login:', err);
                setUser(null);
            }
        };
        checkLogin();
    }, []);


    const fetchDiskusi = useCallback(async () => {
        if (!id_barang) return;
        try {
            const res = await fetch(`/api/diskusi/${id_barang}`);
            const data = await res.json();
            setDiskusi(data.diskusi);
        } catch (err) {
            console.error("Gagal mengambil diskusi:", err);
        }
    }, [id_barang]);

    useEffect(() => {
        fetchDiskusi();
    }, [fetchDiskusi]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePostDiskusi = async (e) => {
        e.preventDefault();

        const token = document.cookie.split('; ')
            .find(row => row.startsWith('token='))?.split('=')[1];

        const res = await fetch(`/api/diskusi/${id_barang}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                isi_diskusi: formData.isi_diskusi
            }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Diskusi berhasil ditambahkan!");
            setFormData({ isi_diskusi: '' });
            setShowModal(false);
            fetchDiskusi();
        } else {
            alert(data.error || "Gagal menambahkan diskusi");
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
        router.push(`/cart/checkout?id_barang=${id_barang}`);
    };

    const handleAddToCart = async () => {
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        try {
            const resCart = await fetch("/api/cart");
            const { cart } = await resCart.json();

            let userCart = cart.find((c) => c.id_pembeli === user.id);

            if (!userCart) {
                const resCreate = await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_pembeli: user.id }),
                });
                const dataCreate = await resCreate.json();
                if (resCreate.ok) {
                    userCart = { id_cart: dataCreate.id_cart };
                } else {
                    alert(dataCreate.error);
                    return;
                }
            }

            const resBridge = await fetch("/api/bridgebarangcart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_cart: userCart.id_cart, id_barang }),
            });

            const bridgeData = await resBridge.json();
            if (resBridge.ok) {
                setShowCartPopup(true);
                setTimeout(() => setShowCartPopup(false), 3000);
            } else {
                alert(bridgeData.error);
            }

        } catch (err) {
            console.error("Gagal tambah ke cart:", err);
        }
    };



    const getFirstLetter = (name) => {
        return name ? name.charAt(0).toUpperCase() : "";
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    function formatDatetime(datetimeStr) {
        if (!datetimeStr) return "";

        const safeStr = datetimeStr.replace(" ", "T");

        const date = new Date(safeStr);

        if (isNaN(date.getTime())) return "Invalid Date";

        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };

        const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);

        return formatted.replace('.', ':').replace(' WIB', '').replace(',', '');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
            .format(date)
            .replace(".", "");
    }

    if (!barang) return <div className="h-screen">Loading...</div>;

    return (
        <div className="px-6 md:px-20 mt-24">
            <div className="grid md:grid-cols-2 gap-4 mb-15">
                <div>
                    <div className="gap-2 mb-4">
                        <div className="flex gap-2 mb-4">
                            {barang.kategori_barang.map((kategori, index) => (
                                <ReuseButton key={index}>
                                    <span className="p-5">{kategori}</span>
                                </ReuseButton>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <img
                            src={previewImg || "/images/default-image.jpg"}
                            alt={barang.nama_barang}
                            className="w-lg h-[500px] object-cover rounded-2xl"
                        />
                    </div>
                    <div className="flex gap-4">
                        {uniqueImages.map((gambar, index) => (
                            <img
                                key={`${gambar.id_gambar}-${index}`}
                                src={gambar.src_img}
                                alt="Thumbnail"
                                onClick={() => setPreviewImg(gambar.src_img)}
                                className={`w-24 h-24 object-cover rounded-xl cursor-pointer ${previewImg === gambar.src_img ? "ring-3 ring-blue-600" : ""
                                    }`}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="gap-2 mb-4">
                        <h2 className="text-2xl font-bold">{barang.nama}</h2>
                    </div>
                    <h1 className="text-4xl font-bold mb-3">{barang.nama_barang}</h1>
                    <p className="text-2xl font-semibold mb-4">
                        {formatPrice(barang.harga_barang)}
                    </p>
                    <div className="flex gap-4 mb-4">
                        <RippleButton onClick={handleBuyNow} className="text-white px-6 py-2 w-full rounded-4xl bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0%,_#26C2FF_0%,_#220593_90%)]">
                            Beli Sekarang
                        </RippleButton>
                        <ReuseButton onClick={handleAddToCart}>
                            <div className="px-4 py-4 rounded-full text-indigo-700 hover:text-white">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                        </ReuseButton>
                    </div>

                    {showLoginPrompt && (
                        <div className="fixed inset-0 z-99 bg-black/40 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                                <h2 className="text-xl font-semibold mb-4">Silakan Login</h2>
                                <p className="mb-4 text-sm text-gray-700">Anda harus login terlebih dahulu untuk melanjutkan pembelian.</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowLoginPrompt(false)}
                                        className="px-4 py-2 bg-gray-300 rounded"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                                    >
                                        Login / Daftar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                    {showCartPopup && (
                        <div className="fixed top-24 right-4 bg-white shadow-lg border rounded-lg p-4 z-50">
                            <div className="flex gap-4 items-center">
                                <img
                                    src={previewImg || "/images/default-image.jpg"}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                    <p className="font-semibold">{barang.nama_barang}</p>
                                    <p className="text-sm text-gray-600">Berhasil ditambahkan ke keranjang</p>
                                    <button
                                        onClick={() => router.push("/cart")}
                                        className="mt-2 text-indigo-600 font-semibold text-sm hover:underline"
                                    >
                                        Lihat Keranjang
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <div
                            className={`mt-4 text-ellipsis overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "" : "h-[350px]"
                                }`}
                        >
                            {barang.deskripsi_barang.split('\n').map((line, index) => (
                                <p className="mt-2" key={index}>{line}</p>
                            ))}

                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-3 text-indigo-600 font-medium hover:underline focus:outline-none"
                        >
                            {isExpanded ? "Lihat lebih sedikit" : "Lihat lebih banyak"}
                        </button>
                    </div>
                    <hr className="border-1 border-indigo-700 opacity-50" />

                    <div className="px-4">
                        <h2 className="text-xl font-semibold mt-4">Detail Barang</h2>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                Berat barang
                            </div>
                            <div className="font-semibold">
                                {barang.berat_barang} gram
                            </div>
                            <div>
                                Status garansi
                            </div>
                            <div className="font-semibold">
                                {barang.tanggal_garansi ? (
                                    <span className="text-green-500">Berlaku hingga: {formatDate(barang.tanggal_garansi)}</span>
                                ) : (
                                    <span className="text-red-500">Tidak Ada</span>
                                )}
                            </div>
                            <div>
                                Diterima ReUseMart sejak tanggal
                            </div>
                            <div className="font-semibold">
                                {formatDate(barang.tanggal_masuk)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diskusi Produk */}
            <div>
                <h1 className="font-semibold text-2xl">Diskusi Produk</h1>
                <div className="mb-4 border-b-2 border-indigo-500 p-4 flex gap-4 items-center">
                    <img
                        src={uniqueImages[0]?.src_img || "/images/default-image.jpg"}
                        alt={barang.nama_barang}
                        className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex flex-col justify-center flex-1">
                        <h4 className="font-semibold text-lg">{barang.nama_barang}</h4>
                        <p className="text-sm text-gray-500">Ada pertanyaan seputar pengiriman, promo, atau lainnya?
                            <a className="font-semibold"> Chat Customer Service</a>
                        </p>
                    </div>
                    <ReuseButton
                        onClick={() => setShowModal(true)}
                    >
                        <div className="px-6 py-3 rounded-full text-indigo-700 hover:text-white">
                            Tanya seputar produk ini
                        </div>
                    </ReuseButton>
                </div>

                <div className="flex flex-col justify-center items-center gap-4">
                    {diskusi.length > 0 ? (
                        diskusi.map((item) => (
                            <div key={item.id_diskusi} className="rounded-2xl p-5 flex gap-4 items-center w-full md:w-[90%] bg-[#f6f7fb]">
                                <div className="flex flex-col justify-center flex-1">
                                    <div className="flex flex-row items-center gap-4 mb-3">
                                        <div className="w-15 h-15 rounded-full flex items-center justify-center overflow-hidden">
                                            {
                                                item.foto_pengirim ? (
                                                    <img
                                                        src={item.foto_pengirim}
                                                        alt={item.nama_pengirim}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                                                        <span className="text-white text-lg font-semibold">
                                                            {getFirstLetter(item.nama_pengirim)}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{item.nama_pengirim}</h4>
                                            <p className="text-xs text-gray-400">{formatDatetime(item.tanggal)}</p>
                                        </div>
                                    </div>
                                    <p className="">{item.isi_diskusi}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-4">Belum ada diskusi untuk produk ini.</p>
                    )}

                    {showModal && (
                        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                                <h2 className="text-lg font-bold mb-4">Tambah diskusi untuk {barang.nama_barang}</h2>
                                <form onSubmit={handlePostDiskusi} className="space-y-4">
                                    <textarea
                                        className="w-full border px-3 py-2 rounded min-h-[200px]"
                                        onChange={handleChange}
                                        value={formData.isi_diskusi}
                                        name="isi_diskusi"
                                        placeholder="Tambahkan pertanyaan atau komentar kamu di sini..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
