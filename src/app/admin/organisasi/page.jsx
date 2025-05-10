'use client';

import { useEffect, useState } from 'react';

import { EllipsisVertical } from "lucide-react";

export default function AdminOrganisasiPage() {
  const [organisasiList, setOrganisasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchOrganisasi = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`/api/organisasi?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok) {
          setOrganisasiList(data.organisasi);
        } else {
          setError(data.error || 'Gagal mengambil data organisasi');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisasi();
  }, [searchQuery]);

  const handleEdit = (org) => {
    setEditData(org);
    setShowSidebar(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editData) {
      setEditData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/organisasi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    if (res.ok) {
      setOrganisasiList((prev) =>
        prev.map((org) => (org.id_organisasi === editData.id_organisasi ? editData : org))
      );
      setShowSidebar(false);
      alert("Data organisasi berhasil diperbarui");
    } else {
      alert("Gagal memperbarui data organisasi");
    }
  };

  const handleDelete = async (id_organisasi) => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menghapus data Organisasi ini?"
    );
    if (!confirm) return;

    const res = await fetch("/api/organisasi", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_organisasi }),
    });

    if (res.ok) {
      setOrganisasiList((prev) => prev.filter((org) => org.id_organisasi !== id_organisasi));
      alert("Data organisasi berhasil dihapus");
    } else {
      alert("Gagal menghapus data organisasi");
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
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Organisasi</h1>
      
      <input
        type="text"
        placeholder="Cari nama atau email organisasi"
        className="text-base mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="overflow-x-auto flex flex-col">
        {/* Table Header */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">Action</th>
              <th className="px-5 py-3 text-white text-left">ID</th>
              <th className="px-5 py-3 text-white text-left">Nama</th>
              <th className="px-5 py-3 text-white text-left">Email</th>
              <th className="px-5 py-3 text-white text-left">Telepon</th>
              <th className="px-5 py-3 text-white text-left">Alamat</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {organisasiList.map((org) => (
              <tr key={org.id_organisasi} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative dropdown-action flex justify-center items-center">
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === org.id_organisasi ? null : org.id_organisasi)
                        }
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <EllipsisVertical />
                      </button>

                      {/* Dropdown yang hanya muncul jika ID-nya cocok */}
                      {activeDropdown === org.id_organisasi && (
                        <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleEdit(org)}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => handleDelete(org.id_organisasi)}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{org.id_organisasi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{org.nama}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{org.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">+62{org.no_telepon}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{org.alamat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSidebar && editData && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black opacity-20"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 bg-white w-full max-w-md h-full shadow-xl transition-transform duration-300">
            <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <h2 className="text-lg font-semibold">Edit Penitip</h2>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col mb-4 gap-6 p-6">
              <div className="">
                <label className="block mb-2 font-semibold text-sm">Nama Organisasi</label>
                <input
                  name="nama"
                  onChange={handleChange}
                  value={editData.nama}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Nama Organisasi"
                />
              </div>
              <div className="">
                <label className="block mb-2 font-semibold text-sm">Email Organisasi</label>
                <input
                  name="email"
                  onChange={handleChange}
                  value={editData.email}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="organisasi@mail.org"
                />
              </div>
              <div className="">
                <label className="block mb-2 font-semibold text-sm">No.Telepon Kontak</label>
                <input
                  name="no_telepon"
                  onChange={handleChange}
                  value={editData.no_telepon}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="+62"
                />
              </div>
              <div className="">
                <label className="block mb-2 font-semibold text-sm">Alamat</label>
                <input
                  name="alamat"
                  onChange={handleChange}
                  value={editData.alamat}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Alamat Kantor "
                />
              </div>
              <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded"
                  >
                    Simpan
                  </button>
                </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
