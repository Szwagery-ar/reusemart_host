'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, EllipsisVertical } from "lucide-react";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

export default function OrgRequestPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(null);
    const [requestList, setRequestList] = useState([]);
    const [requestLoading, setRequestLoading] = useState(false);

    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const [formData, setFormData] = useState({
        deskripsi: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                        fetchRequestOrg();
                    } else {
                        setUser(null);
                        setError(userData.message || 'User not authenticated');
                        router.push('/login');
                    }
                } else {
                    setUser(null);
                    setError(userData.message || 'User not authenticated');
                    if (res.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Terjadi kesalahan');
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editData) {
            setEditData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = document.cookie.split('; ')
            .find(row => row.startsWith('token='))?.split('=')[1];

        const res = await fetch('/api/requestdonasi/by-org', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
            alert("Request berhasil ditambahkan!");
            setFormData({ deskripsi: '' });
            setShowModal(false);
            fetchRequestOrg();
        } else {
            alert(data.error || 'Gagal menambahkan request');
        }
    };

    const handleEdit = (requestDonasi) => {
        setEditData(requestDonasi);
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/requestdonasi/by-org', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData),
        });

        if (res.ok) {
            setRequestList((prev) => prev.map(request => request.id_request === editData.id_request ? editData : request));
            setShowModal(false);
            alert('Data berhasil diperbarui');
        } else {
            alert('Gagal memperbarui data');

        }
    };

    const handleDelete = async (id_request) => {
        const confirm = window.confirm('Apakah Anda yakin ingin menghapus data ini?');
        if (!confirm) return;

        const res = await fetch('/api/requestdonasi/by-org', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_request })
        });

        if (res.ok) {
            setRequestList(prev => prev.filter(request => request.id_request !== id_request));
            alert('Data berhasil dihapus');
        } else {
            alert('Gagal menghapus data');
        }
    };

    // REQUEST
    const fetchRequestOrg = async () => {
        try {
            setRequestLoading(true);
            const res = await fetch(`/api/requestdonasi/by-org?q=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("SQL fetch error:", error);
                console.error("Gagal mengambil request:", errorData.error || res.status);
                return;
            }

            const data = await res.json();
            setRequestList(data.request);
        } catch (err) {
            setError('Gagal mengambil data Request');
            console.error('Error fetching request data:', err);
        } finally {
            setRequestLoading(false);
        }
    }

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
        fetchRequestOrg();
    }, [searchQuery]);

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

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <h2 className="text-4xl font-[Montage-Demo]">Request Donasi</h2>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="semua" className="mb-4">
                <TabsList className="flex gap-4">
                    {[
                        "Semua",
                        "Pending",
                        "Diterima",
                        "Selesai",
                        "Dibatalkan",
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase().replace(/ /g, "-")}
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Search and Filters */}
            <div className="flex gap-4 items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari deskripsi atau status request"
                    className="text-base px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="relative">
                    <Button variant="outline" className="flex items-center gap-5">
                        Tanggal Request <CalendarIcon size={16} />
                    </Button>
                </div>
                <Input type="date" className="w-1/4" />
                <button
                    onClick={() => setShowModal(true)}
                    className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Buat Request
                </button>
            </div>

            <div className="overflow-x-auto flex flex-col">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                            <th className="px-5 py-3 text-white text-left">Action</th>
                            <th className="px-5 py-3 text-white text-left">ID</th>
                            <th className="px-5 py-3 text-white text-left">Tanggal Request</th>
                            <th className="px-5 py-3 text-white text-left">Deskripsi</th>
                            <th className="px-5 py-3 text-white text-left">Status Request</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {/* Items */}
                        {requestList.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="w-full flex flex-row justify-center p-4 mt-3 rounded-xl border-1 border-black text-sm">
                                        <p>Belum ada Request Donasi dibuat.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            requestList.map((item, index) => (
                                <tr key={item.id_request} className="rounded-xl border border-black text-sm hover:bg-gray-50">
                                    <td className="py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative dropdown-action flex justify-center items-center">
                                            <button
                                                onClick={() => setActiveDropdown(
                                                    activeDropdown === item.id_request
                                                        ? null
                                                        : item.id_request)
                                                }
                                                className="text-gray-400 hover:text-indigo-600"
                                            >
                                                <EllipsisVertical />
                                            </button>
                                            {activeDropdown === item.id_request && (
                                                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded shadow-md z-10">
                                                    <button
                                                        className={`block w-full px-4 py-2 text-left text-sm ${["APPROVED", "DONE", "CANCELLED"].includes(item.status_request)
                                                            ? "cursor-not-allowed text-gray-400"
                                                            : "hover:bg-gray-100"
                                                            }`}
                                                        onClick={() =>
                                                            !["APPROVED", "DONE", "CANCELLED"].includes(item.status_request) &&
                                                            handleEdit(item)
                                                        }
                                                        disabled={["APPROVED", "DONE", "CANCELLED"].includes(item.status_request)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className={`block w-full px-4 py-2 text-left text-sm ${["APPROVED", "DONE"].includes(item.status_request)
                                                                ? "cursor-not-allowed text-red-300"
                                                                : "text-red-600 hover:bg-gray-100"
                                                            }`}
                                                        onClick={() =>
                                                            !["APPROVED", "DONE"].includes(item.status_request) &&
                                                            handleDelete(item.id_request)
                                                        }
                                                        disabled={["APPROVED", "DONE"].includes(item.status_request)}
                                                    >
                                                        Hapus
                                                    </button>

                                                </div>
                                            )}

                                        </div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.id_request}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.tanggal_request}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.deskripsi}</td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.status_request}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {requestList.length > 0 && (
                    <div className="mt-2 mb-4 flex justify-center items-center gap-2">
                        <Button variant="outline" size="sm">1</Button>
                        <Button variant="ghost" size="sm">▶</Button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Request Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                className="w-full border px-3 py-2 rounded"
                                onChange={handleChange}
                                value={formData.deskripsi}
                                name="deskripsi"
                                placeholder="Jelaskan apa yang organisasi Anda butuhkan"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && editData && (
                <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Edit Request</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <textarea
                                className="w-full border px-3 py-2 rounded"
                                onChange={handleChange}
                                value={editData.deskripsi}
                                name="deskripsi"
                                placeholder="Jelaskan apa yang organisasi Anda butuhkan"
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
    );
}
