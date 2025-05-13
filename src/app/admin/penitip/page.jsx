"use client";

import { useEffect, useRef, useState } from "react";
import WithRole from "@/components/WithRole/WithRole";
import { EllipsisVertical } from "lucide-react";

export default function AdminPenitipPage() {
    const [penitipList, setPenitipList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditSidebar, setShowEditSidebar] = useState(false);
    const [editData, setEditData] = useState(null);

    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        no_ktp: '',
        no_telepon: '',
        password: '',
    });

    useEffect(() => {
        const fetchPenitip = async () => {
            try {
                const res = await fetch(`/api/penitip?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (res.ok) {
                    setPenitipList(data.penitip);
                } else {
                    setError(data.error || "Gagal mengambil data penitip");
                }
            } catch (err) {
                console.error("Error fetching penitip:", err);
                setError("Terjadi kesalahan saat mengambil data");
            } finally {
                setLoading(false);
            }
        };

        fetchPenitip();
    }, [searchQuery]);

    const handleEdit = (penitip) => {
        setEditData(penitip);
        setShowEditSidebar(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/penitip", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editData),
        });

        if (res.ok) {
            setPenitipList((prev) => prev.map((p) => (p.id_penitip === editData.id_penitip ? editData : p)));
            setShowEditSidebar(false);
            alert("Data berhasil diperbarui");
        } else {
            alert("Gagal memperbarui data");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editData) {
            setEditData((prev) => ({ ...prev, [name]: value }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = document.cookie.split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
        const res = await fetch("/api/penitip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            setPenitipList((prev) => [
                ...prev,
                { ...formData, id_penitip: data.id_penitip },
            ]);
            setShowModal(false);
            setFormData({
                nama: "",
                email: "",
                no_ktp: "",
                no_telepon: "",
                password: "",
            });
            alert("Penitip berhasil ditambahkan");
        } else {
            alert(data.error || "Gagal menambahkan penitip");
        }
    };

    const handleDelete = async (id_penitip) => {
        const confirm = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
        if (!confirm) return;

        const res = await fetch("/api/penitip", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_penitip }),
        });

        if (res.ok) {
            setPenitipList((prev) => prev.filter((p) => p.id_penitip !== id_penitip));
            alert("Data berhasil dihapus");
        } else {
            alert("Gagal menghapus data");
        }
    };

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
    
    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <WithRole allowed={["CS", "Superuser"]}>
                <h1 className="text-2xl font-bold mb-4 text-indigo-700">
                    Data Penitip
                </h1>
                <div className="flex justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama/email..."
                        className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Tambah Penitip
                    </button>
                </div>
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    Nama
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    KTP
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    Telepon
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    Badge
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    Total Barang
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {penitipList.map((p) => (
                                <tr key={p.id_penitip} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {p.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {p.nama}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {p.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {p.no_ktp}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        +62{p.no_telepon}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {p.badge_level}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {p.total_barang}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative dropdown-action flex justify-center items-center">
                                            <button
                                                onClick={() =>
                                                    setActiveDropdown(
                                                        activeDropdown === p.id_penitip
                                                            ? null
                                                            : p.id_penitip
                                                    )
                                                }
                                                className="text-gray-400 hover:text-indigo-600"
                                            >
                                                <EllipsisVertical />
                                            </button>

                                            {activeDropdown === p.id_penitip && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                                                    <button
                                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                        onClick={() => handleEdit(p)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                                        onClick={() => handleDelete(p.id_penitip)}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                            <h2 className="text-lg font-bold mb-4">Tambah Penitip</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    name="nama"
                                    onChange={handleChange}
                                    value={formData.nama}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Nama"
                                />
                                <input
                                    name="email"
                                    onChange={handleChange}
                                    value={formData.email}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Email"
                                />
                                <input
                                    name="no_ktp"
                                    onChange={handleChange}
                                    value={formData.no_ktp}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="No. KTP"
                                />
                                <input
                                    name="no_telepon"
                                    onChange={handleChange}
                                    value={formData.no_telepon}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="No. Telepon"
                                />
                                <input
                                    name="password"
                                    type="password"
                                    onChange={handleChange}
                                    value={formData.password}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Password"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-200 rounded"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditSidebar && editData && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black opacity-20"
                            onClick={() => setShowEditSidebar(false)}
                        />
                        <div className="fixed inset-y-0 right-0 z-50 bg-white w-full max-w-md h-full p-6 shadow-xl transition-transform duration-300">
                            <h2 className="text-lg font-bold mb-4">Edit Penitip</h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <input
                                    name="nama"
                                    onChange={handleChange}
                                    value={editData.nama}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Nama"
                                />
                                <input
                                    name="email"
                                    onChange={handleChange}
                                    value={editData.email}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Email"
                                />
                                <input
                                    name="no_ktp"
                                    onChange={handleChange}
                                    value={editData.no_ktp}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="No. KTP"
                                />
                                <input
                                    name="no_telepon"
                                    onChange={handleChange}
                                    value={editData.no_telepon}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="No. Telepon"
                                />
                                <input
                                    name="badge_level"
                                    onChange={handleChange}
                                    value={editData.badge_level}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Badge Level"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditSidebar(false)}
                                        className="px-4 py-2 bg-gray-200 rounded"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </WithRole>
        </div>
    );
}
