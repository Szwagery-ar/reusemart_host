"use client";

import { useEffect, useState } from "react";
import { EllipsisVertical } from "lucide-react";

export default function AdminPembeliPage() {
  const [pembeliList, setPembeliList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchPembeli = async () => {
      try {
        const res = await fetch(
          `/api/pembeli?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (res.ok) {
          setPembeliList(data.pembeli);
        } else {
          setError(data.error || "Gagal mengambil data penitip");
        }
      } catch (err) {
        console.error("Error fetching pembeli:", err);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchPembeli();
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Data Pembeli</h1>
      <input
        type="text"
        placeholder="Cari nama/email/telepon..."
        className="mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              {["ID", "Nama", "Email", "Telepon", "Poin", "Action"].map(
                (col) => (
                  <th key={col} className="px-5 py-3 text-white text-left">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {pembeliList.map((pembeli, index) => (
              <tr
                key={`${pembeli.id_pembeli}-${index}`}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {pembeli.id_pembeli}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pembeli.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {pembeli.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  +62{pembeli.no_telepon}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {pembeli.poin_loyalitas}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative dropdown-action flex justify-center items-center">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === pembeli.id_pembeli
                            ? null
                            : pembeli.id_pembeli
                        )
                      }
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <EllipsisVertical />
                    </button>

                    {/* Dropdown yang hanya muncul jika ID-nya cocok */}
                    {activeDropdown === pembeli.id_pembeli && (
                      <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                        <button
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => handleEdit(pembeli)}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(pembeli.id_pembeli)}
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
    </div>
  );
}
