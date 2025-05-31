"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import RippleButton from "@/components/RippleButton/RippleButton";
import AlamatModal from "@/components/AlamatModal/AlamatModal";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [processing, setProcessing] = useState(false);
    const id_transaksi = searchParams.get("id_transaksi");

    const [pembeli, setPembeli] = useState(null);
    const [transaksi, setTransaksi] = useState(null);
    const [barangList, setBarangList] = useState([]);
    const [alamatList, setAlamatList] = useState([]);
    const [selectedAlamat, setSelectedAlamat] = useState(null);
    const [jenisPengiriman, setJenisPengiriman] = useState("COURIER");
    const [ongkir, setOngkir] = useState(0);

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resUser = await fetch("/api/auth/me");
                const userData = await resUser.json();
                if (!resUser.ok || !userData.success) {
                    router.push("/login");
                    return;
                }

                setPembeli(userData.user);

                const resAlamat = await fetch("/api/alamat");
                const dataAlamat = await resAlamat.json();
                if (resAlamat.ok) setAlamatList(dataAlamat.alamat);

                if (id_transaksi) {
                    const resTransaksi = await fetch(`/api/transaksi/${id_transaksi}`);
                    const dataTransaksi = await resTransaksi.json();
                    if (resTransaksi.ok) {
                        setTransaksi(dataTransaksi.transaksi);
                        setBarangList(dataTransaksi.barang);
                    }
                }
            } catch (err) {
                console.error("Gagal fetch data:", err);
                router.push("/login");
            }
        };

        fetchData();
    }, [id_transaksi, router]);

    useEffect(() => {
        if (transaksi && jenisPengiriman === "COURIER") {
            const ongkos = transaksi.harga_awal >= 1500000 ? 0 : 100000;
            setOngkir(ongkos);
        } else {
            setOngkir(0);
        }
    }, [jenisPengiriman, transaksi]);

    const handleBayar = async () => {
        if (processing) return;
        setProcessing(true);
        
        try {
            const res = await fetch("/api/pembayaran", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_transaksi,
                    img_bukti_transfer: "dummy-image.png",
                    jenis_pengiriman: jenisPengiriman,
                    ongkos_kirim: ongkir,
                    id_alamat: jenisPengiriman === "COURIER" ? selectedAlamat?.id_alamat : null
                })
            });

            if (!res.ok) throw new Error("Gagal memproses pembayaran");

            router.push(`/cart/checkout/pembayaran?id_transaksi=${id_transaksi}`);
        } catch (err) {
            console.error("Gagal update pengiriman:", err);
            alert("Gagal mengatur pengiriman. Silakan coba lagi.");
        }
    };

    if (!transaksi || !pembeli) return <div className="p-6">Loading...</div>;

    return (
        <div className="">
            <div className="bg-white text-3xl font-medium py-3 px-8 sticky top-0">CERITANYA LOGO</div>

            <div className="p-6 md:p-12 bg-[#EDF6FF] min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="font-semibold mb-4">Metode Pengiriman</h2>
                            <div className="flex gap-4 mb-4">
                                {['COURIER', 'SELF_PICKUP'].map((method) => (
                                    <button
                                        key={method}
                                        className={`px-4 py-2 rounded-full font-semibold border ${jenisPengiriman === method
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "text-gray-700 border-gray-300"
                                            }`}
                                        onClick={() => setJenisPengiriman(method)}
                                    >
                                        {method === 'COURIER' ? 'Kurir' : 'Ambil Sendiri'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600">
                                {jenisPengiriman === "COURIER"
                                    ? "Kirim ke alamat kamu dengan estimasi tiba 2–3 hari."
                                    : "Ambil langsung ke lokasi ReUseMart. Gratis tanpa ongkos kirim."}
                            </p>
                        </div>

                        {jenisPengiriman === "COURIER" && (
                            <div className="bg-white p-4 rounded shadow">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold mb-1">Alamat Pengiriman</h2>
                                        {selectedAlamat ? (
                                            <div className="text-sm text-gray-700">
                                                <p className="font-medium">{selectedAlamat.nama_alamat}</p>
                                                <p>{selectedAlamat.lokasi}</p>
                                                {selectedAlamat.note && (
                                                    <p className="text-xs italic text-gray-500">Catatan: {selectedAlamat.note}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Belum ada alamat dipilih</p>
                                        )}
                                    </div>
                                    <AlamatModal selectedAlamat={selectedAlamat} setSelectedAlamat={setSelectedAlamat} />
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded shadow space-y-4">
                            <h2 className="font-semibold mb-3">Barang yang Dibeli</h2>
                            {barangList.map((b) => (
                                <div key={b.id_barang} className="flex gap-4 items-center border-b pb-2">
                                    <img
                                        src={b.src_img}
                                        className="w-20 h-20 object-cover rounded"
                                        alt={b.nama_barang}
                                    />
                                    <div>
                                        <h3 className="font-medium">{b.nama_barang}</h3>
                                        <p className="text-sm text-gray-600">{formatRupiah(b.harga_barang)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded shadow space-y-4">
                        <h2 className="text-lg font-semibold">Ringkasan Pembayaran</h2>
                        <div className="flex justify-between">
                            <span>Harga Barang</span>
                            <span>{formatRupiah(transaksi.harga_awal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Diskon (Poin)</span>
                            <span className="text-green-600">-{formatRupiah(transaksi.diskon)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Ongkos Kirim</span>
                            <span>{formatRupiah(ongkir)}</span>
                        </div>
                        <hr />
                        <div className="">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Bayar</span>
                                <span>{formatRupiah(transaksi.harga_awal - transaksi.diskon + ongkir)}</span>
                            </div>
                            <div className="text-xs">Mendapatkan {transaksi.tambahan_poin} poin loyalitas dari transaksi ini</div>
                        </div>
                        <RippleButton
                            onClick={handleBayar}
                            className="text-white px-4 py-3 rounded-lg font-semibold w-full my-4 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0%,_#26C2FF_0%,_#220593_90%)]"
                        >
                            Bayar Sekarang
                        </RippleButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
