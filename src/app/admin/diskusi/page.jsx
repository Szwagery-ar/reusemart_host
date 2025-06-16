"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical } from "lucide-react";
import WithRole from "@/components/WithRole/WithRole";

export default function AdminDiskusiPage() {
  const router = useRouter();

  const [diskusiList, setdiskusiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchDiskusi = async () => {
      try {
        const res = await fetch(
          `/api/diskusi?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();

        if (res.ok) {
          setdiskusiList(data.diskusi);
        } else {
          setError(data.error || "Gagal mengambil data diskusi");
        }
      } catch (err) {
        console.error("Error fetching penitip:", err);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchDiskusi();
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

  function formatDatetime(datetimeStr) {
    if (!datetimeStr) return "";

    const safeStr = datetimeStr.replace(" ", "T");

    const date = new Date(safeStr);

    if (isNaN(date.getTime())) return "Invalid Date";

    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const formatted = new Intl.DateTimeFormat("id-ID", options).format(date);

    return formatted.replace(".", ":").replace(" WIB", "").replace(",", "");
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 relative">
      <WithRole allowed={["CS", "Superuser"]}>
        <h1 className="text-4xl font-[Montage-Demo] mb-4">Diskusi</h1>
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Cari nama/email..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto flex flex-col">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                {[
                  "ID",
                  "Nama Pengirim",
                  "Nama Barang",
                  "Isi Diskusi",
                  "Tanggal Kirim",
                  "Action",
                ].map((col) => (
                  <th key={col} className="px-5 py-3 text-white text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {diskusiList.map((d, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 hover:bg-gray-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {d.id_diskusi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {d.pembeli_name || d.penitip_name || d.pegawai_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {d.nama_barang}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {d.isi_diskusi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDatetime(d.tanggal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="relative dropdown-action flex justify-center items-center">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === d.id_diskusi
                              ? null
                              : d.id_diskusi
                          )
                        }
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <EllipsisVertical />
                      </button>

                      {activeDropdown === d.id_diskusi && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() =>
                              router.push(`/belanja/${d.id_barang}`)
                            }
                          >
                            Lihat Barang
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
      </WithRole>
    </div>
  );
}
