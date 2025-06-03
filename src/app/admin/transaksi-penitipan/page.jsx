'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default function TransaksiPenitipanPage() {
    const [barangList, setBarangList] = useState([]);
    const [penitipOptions, setPenitipOptions] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [qcOptions, setQcOptions] = useState([]);

    const [formDataList, setFormDataList] = useState([
        {
            nama_barang: '',
            harga_barang: '',
            deskripsi_barang: '',
            berat_barang: '',
            tanggal_garansi: '',
            tanggal_masuk: '',
            id_penitip: '',
            id_petugas_qc: '',
            gambar: null,
            kategori_ids: [],
            isEditing: false,
        }
    ]);

    const handleChange = (index, e) => {
        const { name, value, type, files } = e.target;
        setFormDataList((prev) => {
            const newList = [...prev];
            newList[index] = {
                ...newList[index],
                [name]: type === 'file' ? files : value,
            };
            return newList;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // for (let i = 0; i < formDataList.length; i++) {
        //     const item = formDataList[i];
        //     if ((item.kategori_ids || []).includes(1) && !item.tanggal_garansi) {
        //         alert(`Barang ke-${i + 1} wajib memiliki tanggal garansi karena termasuk Elektronik`);
        //         return;
        //     }
        // }

        const token = document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1];

        const form = new FormData();
        form.append("items", JSON.stringify(formDataList));

        formDataList.forEach((item, index) => {
            Array.from(item.gambar || []).forEach(file => {
                form.append(`gambar_barang_${index}`, file);
            });
        });

        const res = await fetch('/api/transaksi-penitipan', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: form,
        });

        const data = await res.json();
        if (res.ok) {
            alert('Semua barang berhasil ditambahkan!');
            fetchBarang();
            setShowSidebar(false);
            setFormDataList([
                {
                    nama_barang: '',
                    harga_barang: '',
                    deskripsi_barang: '',
                    berat_barang: '',
                    tanggal_garansi: '',
                    tanggal_masuk: '',
                    id_penitip: '',
                    gambar: null,
                }
            ]);
        } else {
            alert(data.error || 'Gagal menambahkan barang');
        }
    };

    const fetchBarang = async () => {
        const res = await fetch(`/api/transaksi-penitipan?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok) {
            setBarangList(data.barang || []);
        }
    };

    const fetchPenitip = async () => {
        const res = await fetch('/api/penitip');
        const data = await res.json();
        setPenitipOptions(data.penitip || []);
    };

    const fetchKategori = async () => {
        const res = await fetch('/api/kategoribarang');
        const data = await res.json();
        setKategoriOptions(data.kategori || []);
    };

    useEffect(() => {
        fetchPenitip();
        fetchKategori();
        fetchQC();
    }, []);

    useEffect(() => {
        fetchBarang();
    }, [searchQuery]);

    const toggleEdit = (index) => {
        setFormDataList(prev => prev.map((item, i) =>
            i === index ? { ...item, isEditing: !item.isEditing } : item
        ));
    };

    const handleRemove = (index) => {
        setFormDataList(prev => prev.filter((_, i) => i !== index));
    };

    const fetchQC = async () => {
        const res = await fetch('/api/pegawai/by-qc'); // endpoint ini harus mengembalikan data pegawai dengan id_jabatan = 1
        const data = await res.json();
        setQcOptions(data.qc || []);
    };


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Transaksi Penitipan Barang</h1>
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
                />
                <button
                    onClick={() => setShowSidebar(true)}
                    // className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                   //w-full text-white py-3 rounded-full font-semibold bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]
                >
                    Tambah Penitipan Barang
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barangList.map((barang) => (
                    <div
                        key={barang.id_barang}
                        // onClick={() => router.push(`/admin/barang/${barang.id_barang}`)}
                        className="border p-4 rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition"
                    >
                        {Array.isArray(barang.gambar_barang) && barang.gambar_barang.length > 0 ? (
                            <img
                                src={barang.gambar_barang[0].src_img}
                                alt={barang.nama_barang}
                                className="w-full h-100 object-cover rounded"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded">
                                Tidak ada gambar
                            </div>
                        )}
                        <h2 className="text-lg font-semibold mt-2">{barang.nama_barang}</h2>
                        <p className="text-sm text-gray-600">Kode: {barang.kode_produk}</p>
                        <p className="text-sm text-gray-600">Harga: Rp{parseInt(barang.harga_barang).toLocaleString("id-ID")}</p>
                        <p className="text-sm text-gray-600">Status Titip: {barang.status_titip}</p>
                        <p className="text-sm text-gray-600">Garansi: {barang.tanggal_garansi?.split('T')[0] || '-'}</p>
                        <p className="text-sm text-gray-600">Tanggal Masuk: {barang.tanggal_masuk?.split('T')[0]}</p>
                        <p className="text-sm text-gray-600">Tanggal Keluar: {barang.tanggal_keluar?.split('T')[0] || '-'}</p>
                        <p className="text-sm text-gray-600">Penitip: {barang.penitip_name || '-'}</p>

                        <div className="mt-2 text-right">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                      router.push(`/admin/transaksi-penitipan/nota-penitipan/${encodeURIComponent(barang.id_penitipan)}`);
                                }}
                                className="text-sm text-blue-600 underline hover:text-blue-800"
                            >
                                Lihat Nota
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {showSidebar && (
                <>
                    <div className="fixed inset-0 z-40 bg-black opacity-20" onClick={() => setShowSidebar(false)} />
                    <div className="fixed inset-y-0 right-0 z-50 bg-white w-3/5 h-full shadow-xl overflow-y-auto">
                        <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                            <h2 className="text-lg">Form Titip Beberapa Barang</h2>
                        </div>
                        <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
                            {formDataList.map((item, index) => (
                                <div key={index} className="border p-4 rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Barang {index + 1}</h3>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => toggleEdit(index)} className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#FFE259_0%,_#FFA751_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition">
                                                {item.isEditing ? "Tutup" : "Edit"}
                                            </button>
                                            <button type="button" onClick={() => handleRemove(index)} className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#FFE6E1_0%,_#CB0404_30%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition">
                                                Hapus
                                            </button>
                                        </div>
                                    </div>

                                    {item.isEditing && (
                                        <div className="mt-4 grid gap-2">
                                            {/* 1. Gambar */}
                                            <div>
                                                <label className="font-semibold text-sm">Gambar Barang:</label>
                                                <input name="gambar" type="file" multiple onChange={(e) => handleChange(index, e)} className="border px-3 py-2 rounded w-full" />
                                                {item.gambar && (
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {Array.from(item.gambar).map((file, i) => (
                                                            <img
                                                                key={i}
                                                                src={URL.createObjectURL(file)}
                                                                alt={`preview-${i}`}
                                                                className="w-20 h-20 object-cover border rounded"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>


                                            {/* 2. Kategori */}
                                            <div className="mt-2">
                                                <label className="font-semibold text-sm">Kategori:</label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {kategoriOptions.map(kat => (
                                                        <label key={kat.id_kategori} className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                value={kat.id_kategori}
                                                                checked={item.kategori_ids.includes(kat.id_kategori)}
                                                                onChange={(e) => {
                                                                    const newList = [...formDataList];
                                                                    const checked = e.target.checked;
                                                                    const val = parseInt(e.target.value);
                                                                    if (checked) {
                                                                        newList[index].kategori_ids = [...(newList[index].kategori_ids || []), val];
                                                                    } else {
                                                                        newList[index].kategori_ids = newList[index].kategori_ids.filter((id) => id !== val);
                                                                    }
                                                                    setFormDataList(newList);
                                                                }}
                                                            />
                                                            <span>{kat.nama_kategori}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 3. Nama Barang */}
                                            <div>
                                                <label className="font-semibold text-sm">Nama Barang:</label>
                                                <input name="nama_barang" value={item.nama_barang} onChange={(e) => handleChange(index, e)} className="border px-3 py-2 rounded w-full" required />
                                            </div>

                                            {/* 4. Harga */}
                                            <div>
                                                <label className="font-semibold text-sm">Harga Barang:</label>
                                                <input name="harga_barang" type="number" value={item.harga_barang} onChange={(e) => handleChange(index, e)} className="border px-3 py-2 rounded w-full" required />
                                            </div>


                                            {/* 5. Berat */}
                                            <div>
                                                <label className="font-semibold text-sm">Berat Barang:</label>
                                                <input name="berat_barang" type="number" value={item.berat_barang} onChange={(e) => handleChange(index, e)} className="border px-3 py-2 rounded w-full" required />
                                            </div>


                                            {/* 6. Penitip */}
                                            <div>
                                                <label className="font-semibold text-sm">Penitip:</label>
                                                <select name="id_penitip" value={item.id_penitip} onChange={(e) => handleChange(index, e)} className="border px-3 py-2 rounded w-full" required>
                                                    <option value="">---</option>
                                                    {penitipOptions.map(p => (
                                                        <option key={p.id_penitip} value={p.id_penitip}>{p.id_penitip} - {p.nama}</option>
                                                    ))}
                                                </select>
                                            </div>


                                            {/* 7. QC */}
                                            <div>
                                                <label className="font-semibold text-sm">Petugas QC:</label>
                                                <select
                                                    name="id_petugas_qc"
                                                    value={item.id_petugas_qc}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="border px-3 py-2 rounded w-full"
                                                    required
                                                >
                                                    <option value="">---</option>
                                                    {qcOptions.map(qc => (
                                                        <option key={qc.id_pegawai} value={qc.id_pegawai}>
                                                            {qc.id_pegawai} - {qc.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>


                                            {/* 8. Deskripsi */}
                                            <div>
                                                <label className="font-semibold text-sm">Deskripsi Barang:</label>
                                                <textarea name="deskripsi_barang" value={item.deskripsi_barang} onChange={(e) => handleChange(index, e)} className="border px-3 py-2 rounded w-full" required />
                                            </div>


                                            {/* Optional: Tanggal Garansi jika Elektronik */}
                                            {item.kategori_ids.includes(1) && (
                                                <div>
                                                    <label className="font-semibold text-sm">Tanggal Garansi:</label>
                                                    <input
                                                        name="tanggal_garansi"
                                                        type="date"
                                                        value={item.tanggal_garansi}
                                                        onChange={(e) => handleChange(index, e)}
                                                        className="border px-3 py-2 rounded w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormDataList([...formDataList, {
                                    nama_barang: '', harga_barang: '', deskripsi_barang: '', berat_barang: '', tanggal_garansi: '', id_penitip: '', gambar: null, kategori_ids: [], isEditing: false
                                }])}
                                className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#E0E0E0_0%,_#4B4B4B_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                            >
                                Tambah Barang Titipan
                            </button>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowSidebar(false)} className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#FFE6E1_0%,_#CB0404_30%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition">Batal</button>
                                <button type="submit" className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition">Simpan Semua</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
