"use client";

import { useEffect, useState } from "react";
import WithRole from "@/components/WithRole/WithRole";
import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PenilaianBarangPage() {
    const [barangList, setBarangList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    // const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [penitipOptions, setPenitipOptions] = useState([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        nama_barang: "",
        kode_produk: "",
        harga_barang: "",
        deskripsi_barang: "",
        berat_barang: "",
        status_titip: "AVAILABLE",
        tanggal_garansi: "",
        tanggal_masuk: "",
        id_penitip: "",
        gambar: null,
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     const token = document.cookie
    //         .split("; ")
    //         .find((row) => row.startsWith("token="))
    //         ?.split("=")[1];

    //     const form = new FormData();
    //     form.append("nama_barang", formData.nama_barang);
    //     form.append("harga_barang", formData.harga_barang);
    //     form.append("deskripsi_barang", formData.deskripsi_barang);
    //     form.append("berat_barang", formData.berat_barang);
    //     form.append("tanggal_garansi", formData.tanggal_garansi);
    //     form.append("id_penitip", formData.id_penitip);

    //     // Append multiple images
    //     if (formData.gambar) {
    //         Array.from(formData.gambar).forEach((file) => {
    //             form.append("gambar", file);
    //         });
    //     }

    //     const res = await fetch("/api/barang", {
    //         method: "POST",
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //         body: form,
    //     });

    //     const data = await res.json();

    //     if (res.ok) {
    //         setBarangList((prev) => [
    //             ...prev,
    //             {
    //                 ...data.barangBaru,
    //                 gambar_barang: [],
    //             }
    //         ]);
    //         setShowSidebar(false);
    //         setFormData({
    //         nama_barang: "",
    //         harga_barang: "",
    //         deskripsi_barang: "",
    //         berat_barang: "",
    //         tanggal_garansi: "",
    //         tanggal_masuk: "",
    //         id_penitip: "",
    //         gambar: null,
    //         });
    //         alert("Barang berhasil ditambahkan");
    //     } else {
    //         alert(data.error || "Gagal menambahkan barang");
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        const form = new FormData();
        form.append("nama_barang", formData.nama_barang);
        form.append("harga_barang", formData.harga_barang);
        form.append("deskripsi_barang", formData.deskripsi_barang);
        form.append("berat_barang", formData.berat_barang);
        form.append("tanggal_garansi", formData.tanggal_garansi);
        form.append("id_penitip", formData.id_penitip);

        if (formData.gambar) {
            Array.from(formData.gambar).forEach((file) => {
                form.append("gambar", file);
            });
        }

        const res = await fetch("/api/barang/by-gudang", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: form,
        });

        const data = await res.json();

        if (res.ok) {
            await fetchBarang(); // fetch ulang agar dapat barang dengan id_barang, gambar_barang, dll.
            setShowSidebar(false);
            setFormData({
                nama_barang: "",
                harga_barang: "",
                deskripsi_barang: "",
                berat_barang: "",
                tanggal_garansi: "",
                tanggal_masuk: "",
                id_penitip: "",
                gambar: null,
            });
            alert("Barang berhasil ditambahkan");
        } else {
            alert(data.error || "Gagal menambahkan barang");
        }
    };

    const fetchBarang = async () => {
        try {
            const res = await fetch("/api/barang/by-gudang");
            const data = await res.json();
            if (res.ok) {
                setBarangList(data.barang);
            } else {
                setError(data.error || "Gagal mengambil data barang");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat mengambil data");
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     const fetchBarang = async () => {
    //         try {
    //             const res = await fetch('/api/barang');
    //             const data = await res.json();
    //             if (res.ok) {
    //                 setBarangList(data.barang);
    //             } else {
    //                 setError(data.error || 'Gagal mengambil data barang');
    //             }
    //         } catch (err) {
    //             setError('Terjadi kesalahan saat mengambil data');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchBarang();
    // }, []);

    // DROPDOWN
    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest(".dropdown-action")) {
                setActiveDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchPenitip = async () => {
            try {
                const res = await fetch("/api/penitip"); // buat endpoint /api/penitip (GET all)
                const data = await res.json();
                setPenitipOptions(data.penitip || []);
            } catch (err) {
                console.error("Gagal mengambil data penitip");
            }
        };
        fetchPenitip();
    }, []);

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const res = await fetch(`/api/penilaian?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (res.ok) {
                    setBarangList(data.barang);
                } else {
                    setError(data.error || "Gagal mengambil data barang");
                }
            } catch (err) {
                console.error("Error fetching barang:", err);
                setError("Terjadi kesalahan saat mengambil data");
            } finally {
                setLoading(false);
            }
        };

        fetchBarang();
    }, [searchQuery]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <WithRole allowed={["Gudang", "Superuser"]}>
                <h1 className="text-3xl font-bold mb-6">Riwayat Barang Dititipkan</h1>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-800 to-blue-500 text-white">
                                <th className="px-4 py-3 rounded-tl-xl">Nota</th>
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Tanggal Pesan</th>
                                <th className="px-4 py-3">Tanggal Lunas</th>
                                <th className="px-4 py-3">Harga</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-tr-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {barangList.map((barang, index) => (
                                <tr key={barang.id_barang} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">25.06.{index + 1}</td>
                                    <td className="px-4 py-3">{barang.nama_penitip}</td>
                                    <td className="px-4 py-3">
                                        {barang.tanggal_masuk?.split("T")[0] || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {barang.tanggal_masuk?.split("T")[0] || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        Rp {parseInt(barang.harga_barang).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${barang.status_titip === "AVAILABLE"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {barang.status_titip === "AVAILABLE"
                                                ? "Sudah Dibayar"
                                                : "Selesai"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <EllipsisVertical className="w-5 h-5 text-gray-500 mx-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </WithRole>
        </div>
    );
}