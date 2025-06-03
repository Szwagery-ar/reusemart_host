"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import WithRole from "@/components/WithRole/WithRole";

export default function AdminPenitipPage() {
  const [penitipList, setPenitipList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);

  const dropdownRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [editData, setEditData] = useState(null);

  const defaultFormData = {
    nama: "",
    email: "",
    no_ktp: "",
    no_telepon: "",
    password: "",
    foto_ktp: null,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [previewKTP, setPreviewKTP] = useState(null);

  // useEffect(() => {
  //     const fetchUser = async () => {
  //         try {
  //             const res = await fetch('/api/auth/me');
  //             const data = await res.json();

  //             if (res.ok && data.success) {
  //                 setUser(data.user);
  //             } else {
  //                 setUser(null);
  //             }
  //         } catch (err) {
  //             console.error('Gagal mengambil user:', err);
  //             setUser(null);
  //         } finally {
  //             setLoadingUser(false);
  //         }
  //     };
  //     fetchUser();
  // }, []);

  useEffect(() => {
    const fetchPenitip = async () => {
      try {
        const res = await fetch(
          `/api/penitip?q=${encodeURIComponent(searchQuery)}`
        );
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

  const handleDelete = async (id_penitip) => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?"
    );
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

  const handleEdit = (penitip) => {
    setEditData({ ...penitip, password: "" });
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
      setPenitipList((prev) =>
        prev.map((p) => (p.id_penitip === editData.id_penitip ? editData : p))
      );
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

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    const form = new FormData();
    form.append("nama", formData.nama);
    form.append("email", formData.email);
    form.append("no_ktp", formData.no_ktp);
    form.append("no_telepon", formData.no_telepon);
    form.append("password", formData.password);
    form.append("foto_ktp", formData.foto_ktp);

    const res = await fetch("/api/penitip", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    if (res.ok) {
      setPenitipList((prev) => [...prev, data.penitipBaru]);
      setShowModal(false);
      setFormData({
        nama: "",
        email: "",
        no_ktp: "",
        no_telepon: "",
        password: "",
        foro_ktp: null,
      });
      alert("Penitip berhasil ditambahkan");
    } else {
      alert(data.error || "Gagal menambahkan penitip");
    }
  };

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

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 relative">
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
        <div className="overflow-x-auto flex flex-col">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                {[
                  "Action",
                  "ID",
                  "Nama",
                  "Email",
                  "KTP",
                  "Telepon",
                  "Badge",
                  "Komisi",
                  "Total Barang",
                ].map((col) => (
                  <th key={col} className="px-5 py-3 text-white text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {penitipList.map((p, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 hover:bg-gray-200"
                >
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div
                      className="relative dropdown-action flex justify-center items-center"
                      ref={dropdownRef}
                    >
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
                        <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
                    {formatRupiah(p.komisi)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.total_barang}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg h-120 max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Tambah Penitip</h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                encType="multipart/form-data"
              >
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
                <div>
                  <label
                    htmlFor="foto_ktp"
                    className="inline-block w-full px-4 py-2 border-1 border-gray-200 text-GR rounded cursor-pointer hover:bg-gray-200 transition"
                  >
                    Pilih Foto KTP
                  </label>

                  <input
                    id="foto_ktp"
                    type="file"
                    accept="image/*"
                    name="foto_ktp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFormData({ ...formData, foto_ktp: file });

                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setPreviewKTP(previewUrl);
                      } else {
                        setPreviewKTP(null);
                      }
                    }}
                    className="hidden"
                  />

                  {formData.foto_ktp && (
                    <p className="text-sm mt-2 text-gray-600">
                      File terpilih: {formData.foto_ktp.name}
                    </p>
                  )}
                </div>
                {previewKTP && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview KTP:</p>
                    <img
                      src={previewKTP}
                      alt="Preview KTP"
                      className="w-full max-h-64 object-contain rounded border"
                    />
                  </div>
                )}
                <input
                  name="no_ktp"
                  onChange={handleChange}
                  value={formData.no_ktp}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="No. KTP"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setPreviewKTP(null);
                      setFormData(defaultFormData);
                    }}
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
              <form
                onSubmit={handleUpdate}
                className="space-y-4 overflow-y-auto max-h-[90vh]"
              >
                <label className="font-semibold text-gray-500">Nama</label>
                <input
                  name="nama"
                  onChange={handleChange}
                  value={editData.nama}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Nama"
                />

                <label className="font-semibold text-gray-500">Email</label>
                <input
                  name="email"
                  onChange={handleChange}
                  value={editData.email}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Email"
                />

                <label className="font-semibold text-gray-500">
                  No. Telepon
                </label>
                <input
                  name="no_telepon"
                  onChange={handleChange}
                  value={editData.no_telepon}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="No. Telepon"
                />

                <label className="font-semibold text-gray-500">NIK</label>
                <input
                  name="no_ktp"
                  onChange={handleChange}
                  value={editData.no_ktp}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="No. KTP"
                />

                <label className="font-semibold text-gray-500">
                  Password Baru (opsional)
                </label>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  value={editData.password || ""}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Kosongkan jika tidak ingin mengganti"
                />

                <label className="font-semibold text-gray-500">Foto KTP</label>
                {editData.foto_ktp ? (
                  <img
                    src={editData.foto_ktp}
                    alt="Foto KTP"
                    className="w-full max-h-64 object-contain border rounded"
                  />
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Tidak ada foto KTP
                  </p>
                )}

                <label className="font-semibold text-gray-500">
                  Badge Level
                </label>
                <input
                  value={editData.badge_level}
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />

                <label className="font-semibold text-gray-500">
                  Status Verifikasi
                </label>
                <select
                  name="is_verified"
                  onChange={handleChange}
                  value={editData.is_verified}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value={0}>Belum Terverifikasi</option>
                  <option value={1}>Terverifikasi</option>
                </select>

                <div className="flex justify-end gap-2 pt-4">
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
