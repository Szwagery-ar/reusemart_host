"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransaksiPenitipanPage() {
    const [barangList, setBarangList] = useState([]);
    const [penitipOptions, setPenitipOptions] = useState([]);
    const [selectedPenitip, setSelectedPenitip] = useState("");

    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [qcOptions, setQcOptions] = useState([]);

    const [formDataList, setFormDataList] = useState([
        {
            nama_barang: "",
            harga_barang: "",
            deskripsi_barang: "",
            berat_barang: "",
            tanggal_garansi: "",
            tanggal_masuk: "",
            id_penitip: "",
            id_petugas_qc: "",
            gambar: null,
            kategori_ids: [],
            isEditing: false,
        },
    ]);

    const handleChange = (index, e) => {
        const { name, value, type, files } = e.target;
        setFormDataList((prev) => {
            const newList = [...prev];
            const item = { ...newList[index] };

            if (type === "file") {
                const newFiles = Array.from(files);
                const existing = item[name] ? Array.from(item[name]) : [];

                const combined = [...existing, ...newFiles];
                item[name] = new FileListItems(combined);
            } else {
                item[name] = value;
            }

            newList[index] = item;
            return newList;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        const form = new FormData();
        const finalItems = formDataList.map((item) => ({
            ...item,
            id_penitip: selectedPenitip,
        }));
        form.append("items", JSON.stringify(finalItems));

        formDataList.forEach((item, index) => {
            Array.from(item.gambar || []).forEach((file) => {
                form.append(`gambar_barang_${index}`, file);
            });
        });

        const res = await fetch("/api/transaksi-penitipan", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: form,
        });

        const data = await res.json();
        if (res.ok) {
            alert("Semua barang berhasil ditambahkan!");
            fetchBarang();
            setShowSidebar(false);
            setFormDataList([
                {
                    nama_barang: "",
                    harga_barang: "",
                    deskripsi_barang: "",
                    berat_barang: "",
                    tanggal_garansi: "",
                    tanggal_masuk: "",
                    id_penitip: "",
                    gambar: null,
                },
            ]);
        } else {
            alert(data.error || "Gagal menambahkan barang");
        }
    };

    const fetchBarang = async () => {
        const res = await fetch(
            `/api/transaksi-penitipan?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (res.ok) {
            setBarangList(data.barang || []);
        }
    };

    const fetchPenitip = async () => {
        const res = await fetch("/api/penitip");
        const data = await res.json();
        setPenitipOptions(data.penitip || []);
    };

    const fetchKategori = async () => {
        const res = await fetch("/api/kategoribarang");
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
        setFormDataList((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, isEditing: !item.isEditing } : item
            )
        );
    };

    const handleRemove = (index) => {
        setFormDataList((prev) => prev.filter((_, i) => i !== index));
    };

    const fetchQC = async () => {
        const res = await fetch("/api/pegawai/by-qc"); // endpoint ini harus mengembalikan data pegawai dengan id_jabatan = 1
        const data = await res.json();
        setQcOptions(data.qc || []);
    };

    function FileListItems(files) {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        return dataTransfer.files;
    }

    return (
        <div className="p-6">
            <h1 className="text-4xl font-[Montage-Demo] mb-4">
                Transaksi Penitipan Barang
            </h1>
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
                    className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                >
                    Tambah Penitipan Barang
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
                {barangList.map((penitipan) => (
                    <div
                        key={penitipan.id_penitipan}
                        className="border p-4 rounded-lg shadow bg-white mb-4"
                    >
                        <h2 className="text-lg font-bold mb-1">
                            Nota #{penitipan.id_penitipan}
                        </h2>
                        <p className="text-gray-600 text-xs">
                            Tanggal Masuk: {penitipan.tanggal_masuk?.split("T")[0]}
                        </p>
                        <p className="text-gray-600 mb-2 text-xs">
                            Penitip: {penitipan.penitip_name}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {penitipan.barang.map((barang, index) => (
                                <div key={index} className="border p-3 rounded bg-gray-50">
                                    {Array.isArray(barang.gambar_barang) &&
                                        barang.gambar_barang.length > 0 ? (
                                        <img
                                            src={barang.gambar_barang[0].src_img}
                                            alt=""
                                            className="w-full h-20 object-cover rounded mb-2"
                                        />
                                    ) : (
                                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400 rounded mb-2">
                                            Tidak ada gambar
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-xs">
                                        {barang.nama_barang}
                                    </h3>
                                    <p className="text-gray-600 text-xs">
                                        Kode: {barang.kode_produk}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        Harga: Rp
                                        {parseInt(barang.harga_barang).toLocaleString("id-ID")}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        Status: {barang.status_titip}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="text-right mt-4 flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    router.push(
                                        `/admin/transaksi-penitipan/nota-penitipan/detail/${penitipan.id_penitipan}`
                                    )
                                }
                                className="px-4 py-2 rounded bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Lihat Detail
                            </button>
                            <button
                                onClick={() =>
                                    router.push(
                                        `/admin/transaksi-penitipan/nota-penitipan/${penitipan.id_penitipan}`
                                    )
                                }
                                className="px-4 py-2 rounded bg-blue-600 text-sm text-white font-medium hover:bg-blue-700"
                            >
                                Lihat Nota
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showSidebar && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black opacity-20"
                        onClick={() => setShowSidebar(false)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 bg-white w-3/5 h-full shadow-xl overflow-y-auto">
                        <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                            <h2 className="text-lg">Form Titip Beberapa Barang</h2>
                        </div>
                        <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="font-semibold">Pilih Penitip :</label>
                                <select
                                    value={selectedPenitip}
                                    onChange={(e) => setSelectedPenitip(e.target.value)}
                                    className="border px-3 py-2 rounded w-full max-w-sm mt-1"
                                    required
                                >
                                    <option value="">Daftar Nama</option>
                                    {penitipOptions.map((p) => (
                                        <option key={p.id_penitip} value={p.id_penitip}>
                                            {p.id_penitip} - {p.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formDataList.map((item, index) => (
                                <div key={index} className="border p-4 rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Barang {index + 1}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleEdit(index)}
                                                className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#FFE259_0%,_#FFA751_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                                            >
                                                {item.isEditing ? "Tutup" : "Edit"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(index)}
                                                className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#FFE6E1_0%,_#CB0404_30%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>

                                    {item.isEditing && (
                                        <div className="mt-4 grid gap-2">
                                            <div>
                                                <label className="font-semibold text-sm">
                                                    Gambar Barang:
                                                </label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {item.gambar &&
                                                        Array.from(item.gambar).map((file, i) => (
                                                            <div key={i} className="relative w-20 h-20">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`preview-${i}`}
                                                                    className="w-full h-full object-cover rounded"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newList = [...formDataList];
                                                                        const newGambar = Array.from(
                                                                            newList[index].gambar
                                                                        ).filter((_, j) => j !== i);
                                                                        newList[index].gambar = new FileListItems(
                                                                            newGambar
                                                                        );
                                                                        setFormDataList(newList);
                                                                    }}
                                                                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-tr rounded-bl"
                                                                >
                                                                    X
                                                                </button>
                                                            </div>
                                                        ))}

                                                    <label className="w-20 h-20 border border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100">
                                                        +
                                                        <input
                                                            type="file"
                                                            name="gambar"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => handleChange(index, e)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <label className="font-semibold text-sm">
                                                    Kategori:
                                                </label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {kategoriOptions.map((kat) => (
                                                        <label
                                                            key={kat.id_kategori}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                value={kat.id_kategori}
                                                                checked={item.kategori_ids.includes(
                                                                    kat.id_kategori
                                                                )}
                                                                onChange={(e) => {
                                                                    const newList = [...formDataList];
                                                                    const checked = e.target.checked;
                                                                    const val = parseInt(e.target.value);
                                                                    if (checked) {
                                                                        newList[index].kategori_ids = [
                                                                            ...(newList[index].kategori_ids || []),
                                                                            val,
                                                                        ];
                                                                    } else {
                                                                        newList[index].kategori_ids = newList[
                                                                            index
                                                                        ].kategori_ids.filter((id) => id !== val);
                                                                    }
                                                                    setFormDataList(newList);
                                                                }}
                                                            />
                                                            <span>{kat.nama_kategori}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">
                                                    Nama Barang:
                                                </label>
                                                <input
                                                    name="nama_barang"
                                                    value={item.nama_barang}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="border px-3 py-2 rounded w-full"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">
                                                    Harga Barang:
                                                </label>
                                                <input
                                                    name="harga_barang"
                                                    type="number"
                                                    value={item.harga_barang}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="border px-3 py-2 rounded w-full"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">
                                                    Berat Barang:
                                                </label>
                                                <input
                                                    name="berat_barang"
                                                    type="number"
                                                    value={item.berat_barang}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="border px-3 py-2 rounded w-full"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">
                                                    Petugas QC:
                                                </label>
                                                <select
                                                    name="id_petugas_qc"
                                                    value={item.id_petugas_qc}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="border px-3 py-2 rounded w-full"
                                                    required
                                                >
                                                    <option value="">---</option>
                                                    {qcOptions.map((qc) => (
                                                        <option key={qc.id_pegawai} value={qc.id_pegawai}>
                                                            {qc.id_pegawai} - {qc.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-semibold text-sm">
                                                    Deskripsi Barang:
                                                </label>
                                                <textarea
                                                    name="deskripsi_barang"
                                                    value={item.deskripsi_barang}
                                                    onChange={(e) => handleChange(index, e)}
                                                    className="border px-3 py-2 rounded w-full"
                                                    required
                                                />
                                            </div>
                                            {item.kategori_ids.includes(1) && (
                                                <div>
                                                    <label className="font-semibold text-sm">
                                                        Tanggal Garansi:
                                                    </label>
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
                                onClick={() =>
                                    setFormDataList([
                                        ...formDataList,
                                        {
                                            nama_barang: "",
                                            harga_barang: "",
                                            deskripsi_barang: "",
                                            berat_barang: "",
                                            tanggal_garansi: "",
                                            id_penitip: "",
                                            gambar: null,
                                            kategori_ids: [],
                                            isEditing: false,
                                        },
                                    ])
                                }
                                className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#E0E0E0_0%,_#4B4B4B_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                            >
                                Tambah Barang Titipan
                            </button>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(false)}
                                    className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#FFE6E1_0%,_#CB0404_30%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition"
                                >
                                    Simpan Semua
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
