"use client";

import { useEffect, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminDonasiPage() {
  const [donasiList, setDonasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchDonasi = async () => {
      try {
        const res = await fetch(
          `/api/donasi?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        console.log("RESPON DONASI:", data);
        if (res.ok) {
          const filtered = (data.donasi || []).filter(
            (d) => d.status_donasi === "APPROVED" || d.status_donasi === "DONE"
          );
          setDonasiList(filtered);
        } else {
          setError(data.error || "Gagal mengambil data donasi");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchDonasi();
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-action")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (item) => {
    if (item.status_donasi === "DONE") {
      alert("Donasi dengan status DONE tidak bisa diedit.");
      return;
    }
    setEditData(item);
    setShowSidebar(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updated = { ...editData };

    if (updated.tanggal_donasi) {
      updated.status_donasi = "DONE";
    }

    const res = await fetch("/api/donasi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (res.ok) {
      setDonasiList((prev) =>
        prev.map((item) =>
          item.id_donasi === updated.id_donasi ? updated : item
        )
      );
      setShowSidebar(false);
      alert("Data berhasil diperbarui");
    } else {
      alert("Gagal memperbarui data");
    }
  };

  const handleDelete = async (id_donasi) => {
    const item = donasiList.find((d) => d.id_donasi === id_donasi);
    if (item?.status_donasi === "DONE") {
      alert("Donasi dengan status DONE tidak bisa dihapus.");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    const res = await fetch("/api/donasi", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_donasi }),
    });

    if (res.ok) {
      setDonasiList((prev) =>
        prev.filter((item) => item.id_donasi !== id_donasi)
      );
      alert("Data berhasil dihapus");
    } else {
      alert("Gagal menghapus data");
    }
  };

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Donasi</h1>
      <input
        type="text"
        placeholder="Cari berdasarkan status atau nama penerima"
        className="text-base mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="overflow-x-auto flex flex-col">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              {[
                "Action",
                "ID Donasi",
                "Status",
                "Tanggal ACC",
                "Tanggal Donasi",
                "Nama Penerima",
                "ID Request",
                "Deskripsi",
                "Barang",
              ].map((col) => (
                <th key={col} className="px-5 py-3 text-white text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {donasiList.map((item) => (
              <tr key={item.id_donasi} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-right font-medium">
                  <div className="relative dropdown-action flex justify-center items-center">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.id_donasi
                            ? null
                            : item.id_donasi
                        )
                      }
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <EllipsisVertical />
                    </button>
                    {activeDropdown === item.id_donasi && (
                      <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                        <button
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(item.id_donasi)}
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.id_donasi}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.status_donasi}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDate(item.tanggal_acc)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.tanggal_donasi ? formatDate(item.tanggal_donasi) : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.nama_penerima}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.id_request}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.deskripsi}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.barang_donasi && item.barang_donasi.length > 0 ? (
                    item.barang_donasi.map((b) => b.nama_barang).join(", ")
                  ) : (
                    <span className="italic text-gray-400">Barang: -</span>
                  )}
                </td>
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
              <h2 className="text-lg font-semibold">Edit Donasi</h2>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col gap-6 p-6">
              <div>
                <label className="block mb-2 font-semibold text-sm">
                  ID Request
                </label>
                <input
                  name="id_request"
                  value={editData.id_request || ""}
                  className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">
                  Status Donasi
                </label>
                <input
                  name="status_donasi"
                  onChange={handleChange}
                  value={editData.status_donasi || ""}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Masukkan status donasi"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm">
                  Tanggal ACC
                </label>
                <DatePicker
                  selected={
                    editData.tanggal_acc ? new Date(editData.tanggal_acc) : null
                  }
                  onChange={(date) =>
                    setEditData((prev) => ({
                      ...prev,
                      tanggal_acc: date.toISOString().split("T")[0],
                    }))
                  }
                  dateFormat="yyyy-MM-dd"
                  className="w-full border px-3 py-2 rounded"
                  placeholderText="Pilih tanggal ACC"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm">
                  Tanggal Donasi
                </label>
                <DatePicker
                  selected={
                    editData.tanggal_donasi
                      ? new Date(editData.tanggal_donasi)
                      : null
                  }
                  onChange={(date) =>
                    setEditData((prev) => ({
                      ...prev,
                      tanggal_donasi: date.toISOString().split("T")[0],
                    }))
                  }
                  dateFormat="yyyy-MM-dd"
                  className="w-full border px-3 py-2 rounded"
                  placeholderText="Pilih tanggal donasi"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm">
                  Nama Penerima
                </label>
                <input
                  name="nama_penerima"
                  onChange={handleChange}
                  value={editData.nama_penerima || ""}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Masukkan nama penerima"
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
