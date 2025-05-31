"use client";

import { set } from "date-fns";
import { useEffect, useState } from "react";

export default function KonfirmasiPembayaranPage() {
    const [pembayarans, setPembayarans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pegawai, setPegawai] = useState(null);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();

                if (res.ok && data.success) {
                    setPegawai(data.user);
                } else {
                    setError('Failed to fetch user data');
                    if (res.status === 401) {
                        router.push('/login/admin');
                    }
                }
            } catch (err) {
                console.error("Gagal mengambil data pegawai:", err);
            }
        };

        fetchUser();
    }, []);



    useEffect(() => {
        const fetchPembayarans = async () => {
            try {
                const res = await fetch("/api/pembayaran/konfirmasi");

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Error response:", text);
                    setError("Gagal mengambil data pembayaran");
                    return;
                }

                const data = await res.json();
                setPembayarans(data.pembayaran);
            } catch (err) {
                console.error("Gagal fetch:", err);
                alert("Terjadi kesalahan saat memuat pembayaran");
            } finally {
                setLoading(false);
            }
        };

        fetchPembayarans();
    }, []);


    const handleKonfirmasi = async (id, status) => {
        try {
            if (!pegawai || !pegawai.id_pegawai) {
                alert("ID pegawai tidak ditemukan. Silakan login ulang.");
                return;
            }

            const res = await fetch(`/api/pembayaran/konfirmasi/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status_pembayaran: status,
                    id_petugas_cs: pegawai.id_pegawai,
                }),
            });

            

            if (!res.ok) throw new Error("Gagal memperbarui status");

            setPembayarans((prev) =>
                prev.filter((item) => item.id_pembayaran !== id)
            );
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui status");
        }
    };

    if (loading) return <div className="p-6">Memuat pembayaran...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Konfirmasi Pembayaran</h1>

            {loading ? (
                <p>Memuat pembayaran...</p>
            ) : pembayarans.length === 0 ? (
                <p>Tidak ada pembayaran.</p>
            ) : (
                <div>
                    <div className="grid grid-cols-[100px_1fr_180px_200px_200px_140px] bg-gradient-to-r from-blue-400 to-indigo-600 text-white p-3 rounded-lg font-semibold text-sm">
                        <div>ID</div>
                        <div>No Nota</div>
                        <div>Status</div>
                        <div>Petugas</div>
                        <div>Bukti Transfer</div>
                        <div className="text-center">Aksi</div>
                    </div>

                    {pembayarans.map((p) => (
                        <div key={p.id_pembayaran} className="grid grid-cols-[100px_1fr_180px_200px_200px_140px] p-3 border-b text-sm items-center">
                            <div>{p.id_pembayaran}</div>
                            <div>{p.no_nota}</div>
                            <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                ${p.status_pembayaran === "PENDING" ? "bg-yellow-100 text-yellow-800"
                                        : p.status_pembayaran === "CONFIRMED" ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"}`}>
                                    {p.status_pembayaran}
                                </span>
                            </div>
                            <div>{p.petugas_name || "-"}</div>
                            <div>
                                {p.img_bukti_transfer ? (
                                    <img
                                        src={p.img_bukti_transfer}
                                        alt="Bukti"
                                        className="w-24 h-16 object-cover border rounded"
                                    />
                                ) : (
                                    <span className="text-gray-500 italic">-</span>
                                )}
                            </div>
                            <div className="flex justify-center gap-2">
                                {p.status_pembayaran === "PENDING" ? (
                                    <>
                                        <button
                                            onClick={() => handleKonfirmasi(p.id_pembayaran, "CONFIRMED")}
                                            className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                                        >
                                            Konfirmasi
                                        </button>
                                        <button
                                            onClick={() => handleKonfirmasi(p.id_pembayaran, "FAILED")}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                                        >
                                            Tolak
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic text-xs">Sudah diproses</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
