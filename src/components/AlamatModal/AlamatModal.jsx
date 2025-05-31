"use client";

import { useEffect, useState } from "react";

import ReuseButton from "@/components/ReuseButton/ReuseButton";

export default function AlamatModal({ selectedAlamat, setSelectedAlamat }) {
    const [alamatList, setAlamatList] = useState([]);
    const [showModalAlamat, setShowModalAlamat] = useState(false);
    const [showModalForm, setShowModalForm] = useState(false);

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [alamatToDelete, setAlamatToDelete] = useState(null);

    const [formData, setFormData] = useState({
        id_alamat: null,
        nama_alamat: "",
        lokasi: "",
        note: "",
    });
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchAlamat();
    }, []);

    const fetchAlamat = async () => {
        const res = await fetch("/api/alamat");
        const data = await res.json();
        if (res.ok) {
            setAlamatList(data.alamat);
            if (!selectedAlamat && data.alamat.length > 0) {
                setSelectedAlamat(data.alamat[0]);
            }
        }
    };

    const handleSaveAlamat = async () => {
        const method = editMode ? "PUT" : "POST";
        const res = await fetch("/api/alamat", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
            await fetchAlamat();
            setShowModalForm(false);
            setFormData({ id_alamat: null, nama_alamat: "", lokasi: "", note: "" });
            setEditMode(false);
        } else {
            alert(data.error);
        }
    };

    const handleEditAlamat = (alamat) => {
        setFormData(alamat);
        setEditMode(true);
        setShowModalForm(true);
    };

    const handleDeleteAlamat = async (id_alamat) => {
        const res = await fetch("/api/alamat", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_alamat }),
        });
        const data = await res.json();
        if (res.ok) {
            await fetchAlamat();
        } else {
            alert(data.error);
        }
    };

    const handleSelectAlamat = (alamat) => {
        setSelectedAlamat(alamat);
        setShowModalAlamat(false);
    };

    useEffect(() => {
        if (showModalAlamat || showModalForm) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        // Bersihkan saat komponen unmount
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showModalAlamat, showModalForm]);


    return (
        <>
            <ReuseButton onClick={() => setShowModalAlamat(true)}>
                <div className="px-4 rounded-full text-indigo-700 hover:text-white">
                    Ganti
                </div>
            </ReuseButton>

            {/* Modal Daftar Alamat */}
            {showModalAlamat && (
                <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh]">
                        <div className="relative mb-4 flex justify-center items-center">
                            <h2 className="text-xl font-bold text-center">Daftar Alamat</h2>
                            <button
                                onClick={() => setShowModalAlamat(false)}
                                className="absolute right-0 text-gray-600 text-2xl hover:text-black"
                                aria-label="Tutup"
                            >
                                &times;
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setFormData({ id_alamat: null, nama_alamat: "", lokasi: "", note: "" });
                                setEditMode(false);
                                setShowModalForm(true);
                            }}

                            className="border-2 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-4xl mb-4 w-full hover:border-indigo-800 transition-colors cursor-pointer"
                        >
                            + Tambah Alamat Baru
                        </button>
                        <div className="overflow-y-auto max-h-[400px] pr-2">
                            {[
                                ...(selectedAlamat ? alamatList.filter((a) => a.id_alamat === selectedAlamat.id_alamat) : []),

                                ...alamatList.filter((a) => a.id_alamat !== selectedAlamat?.id_alamat)
                            ].map((a) => {
                                const isSelected = selectedAlamat?.id_alamat === a.id_alamat;

                                return (
                                    <div
                                        key={a.id_alamat}
                                        className={`rounded-xl border ${isSelected ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
                                            } p-4 mb-4 relative`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {a.nama_alamat}{" "}
                                                    {a.note?.toLowerCase().includes("utama") && (
                                                        <span className="bg-gray-200 text-xs text-gray-800 font-semibold px-2 py-0.5 rounded ml-1">
                                                            Utama
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="font-semibold text-sm">Szwagery AR</p>
                                                <p className="text-sm text-gray-700 mt-1">{a.note}</p>
                                                <p className="text-sm text-gray-700">{a.lokasi}</p>
                                            </div>

                                            {isSelected ? (
                                                <div className="text-indigo-600 font-bold text-xl">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>

                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelectAlamat(a)}
                                                    className="text-white bg-indigo-600 text-sm font-medium px-4 py-1.5 rounded"
                                                >
                                                    Pilih
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-4 text-sm text-indigo-700 font-medium mt-4">

                                            <button
                                                onClick={() => handleEditAlamat(a)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Ubah Alamat
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAlamatToDelete(a);
                                                    setShowConfirmDelete(true);
                                                }}
                                                className="text-red-600 hover:underline"
                                            >
                                                Hapus
                                            </button>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {showConfirmDelete && alamatToDelete && (
                            <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
                                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                                    <h2 className="text-lg font-bold mb-4 text-center">Konfirmasi Hapus</h2>
                                    <p className="text-sm text-gray-700 mb-6 text-center">
                                        Apakah kamu yakin ingin menghapus alamat <strong>{alamatToDelete.nama_alamat}</strong>?
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowConfirmDelete(false)}
                                            className="px-4 py-2 text-gray-600"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await handleDeleteAlamat(alamatToDelete.id_alamat);
                                                setShowConfirmDelete(false);
                                                setAlamatToDelete(null);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Modal Form Alamat */}
            {showModalForm && (
                <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editMode ? "Ubah Alamat" : "Tambah Alamat"}
                        </h2>
                        <div className="mb-4 relative">
                            <label htmlFor="nama_alamat" className="text-sm text-gray-500 absolute -top-2 left-3 bg-white px-1">
                                Label Alamat
                            </label>
                            <input
                                id="nama_alamat"
                                type="text"
                                maxLength={30}
                                value={formData.nama_alamat}
                                onChange={(e) =>
                                    setFormData({ ...formData, nama_alamat: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 pt-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-xs text-gray-400 text-right mt-1">
                                {formData.nama_alamat.length}/30
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <label htmlFor="lokasi" className="text-sm text-gray-500 absolute -top-2 left-3 bg-white px-1">
                                Lokasi
                            </label>
                            <textarea
                                id="lokasi"
                                maxLength={255}
                                value={formData.lokasi}
                                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 pt-4 text-sm h-32 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-xs text-gray-400 text-right mt-1">
                                {formData.lokasi.length}/255
                            </div>
                        </div>

                        <div className="mb-4 relative">
                            <label htmlFor="note" className="text-sm text-gray-500 absolute -top-2 left-3 bg-white px-1">
                                Catatan (opsional)
                            </label>
                            <input
                                id="note"
                                type="text"
                                maxLength={50}
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 pt-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-xs text-gray-400 text-right mt-1">
                                {formData.note.length}/50
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModalForm(false)}
                                className="text-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveAlamat}
                                className="bg-indigo-600 text-white px-4 py-2 rounded"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
