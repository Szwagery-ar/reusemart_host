"use client";

import { useEffect, useState } from "react";
import { EllipsisVertical, X } from "lucide-react";
import WithRole from "@/components/WithRole/WithRole";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminKlaimPage() {
  const [klaimList, setKlaimList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedKlaim, setSelectedKlaim] = useState(null);
  const [selectedPickupDate, setSelectedPickupDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSidebar]);

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

  const fetchKlaimList = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/klaim");
      if (!res.ok) throw new Error("Gagal memuat data klaim");
      const data = await res.json();
      setKlaimList(data.klaim);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memuat klaim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlaimList();
  }, []);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDetailClick = (item) => {
    setSelectedKlaim(item);
    setShowSidebar(true);
  };

  const handleAturJadwalAmbil = async () => {
    if (!selectedPickupDate) return toast.error("Tanggal ambil harus diisi.");

    try {
      const res = await fetch(
        `/api/klaim/${selectedKlaim.id_klaim}/atur-ambil`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tanggal_ambil: selectedPickupDate }),
        }
      );

      if (!res.ok) throw new Error("Gagal mengatur jadwal ambil");
      toast.success("Jadwal pengambilan berhasil diatur");
      setShowSidebar(false);
      fetchKlaimList();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengatur jadwal ambil");
    }
  };

  const handleSelesaiAmbil = async () => {
    try {
      const res = await fetch(`/api/klaim/${selectedKlaim.id_klaim}/selesai`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      toast.success("Status berhasil diubah menjadi SUDAH DIAMBIL");
      setShowSidebar(false);
      fetchKlaimList();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memperbarui status");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUDAH DIAMBIL":
        return "bg-green-100 text-green-800";
      case "DIBATALKAN":
        return "bg-red-100 text-red-800";
      case "BELUM DIAMBIL":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <WithRole allowed={["CS", "Superuser"]}>
        <h1 className="text-4xl font-[Montage-Demo] mb-4">
          Manajemen Pengiriman
        </h1>
        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="ALL">Semua Klaim</option>
            <option value="BELUM">Belum Diambil</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] text-white p-3 rounded-lg font-semibold text-sm">
            <div>ID</div>
            <div>Nama Pembeli</div>
            <div>Nama Merch</div>
            <div>Tanggal Klaim</div>
            <div>Tanggal Ambil</div>
            <div>Status</div>
            <div className="text-center">Action</div>
          </div>

          {klaimList
            .filter((item) => {
              if (statusFilter === "BELUM") {
                return item.status !== "SUDAH DIAMBIL";
              }
              return true;
            })
            .map((item) => (
              <div
                key={item.id_klaim}
                className="grid grid-cols-7 gap-2 text-sm px-4 py-2 mt-3 border rounded-xl"
              >
                <div>{item.id_klaim}</div>
                <div>{item.nama_pembeli}</div>
                <div>{item.nama_merch}</div>
                <div>
                  {item.tanggal_klaim
                    ? formatDateTime(item.tanggal_klaim)
                    : "-"}
                </div>
                <div>
                  {item.tanggal_ambil
                    ? formatDateTime(item.tanggal_ambil)
                    : "-"}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-center relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === item.id_klaim ? null : item.id_klaim
                      )
                    }
                  >
                    <EllipsisVertical />
                  </button>
                  {activeDropdown === item.id_klaim && (
                    <div className="dropdown-action absolute right-0 mt-2 w-40 bg-white shadow border rounded z-10">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleDetailClick(item)}
                      >
                        Lihat Detail
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Sidebar Detail */}
        {showSidebar && selectedKlaim && (
          <div className="fixed inset-0 bg-black/30 z-40 flex justify-end">
            <div className="bg-white max-w-md w-full h-full overflow-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Detail Klaim</h2>
                <button onClick={() => setShowSidebar(false)}>
                  <X />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>No Klaim:</strong> {selectedKlaim.id_klaim}
                </div>
                <div>
                  <strong>Pembeli:</strong> {selectedKlaim.nama_pembeli}
                </div>
                <div>
                  <strong>Merchandise:</strong> {selectedKlaim.nama_merch}
                </div>
                <div>
                  <strong>Tanggal Klaim:</strong>{" "}
                  {formatDateTime(selectedKlaim.tanggal_klaim)}
                </div>
                <div>
                  <strong>Tanggal Ambil:</strong>{" "}
                  {selectedKlaim.tanggal_ambil
                    ? formatDateTime(selectedKlaim.tanggal_ambil)
                    : "-"}
                </div>
                <div>
                  <strong>Status:</strong> {selectedKlaim.status}
                </div>
              </div>

              {!selectedKlaim.tanggal_ambil ? (
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-1">
                    Atur Jadwal Ambil
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedPickupDate}
                    onChange={(e) => setSelectedPickupDate(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-3"
                  />
                  <button
                    onClick={handleAturJadwalAmbil}
                    className="w-full bg-indigo-600 text-white py-2 rounded"
                  >
                    Simpan Jadwal Ambil
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSelesaiAmbil}
                  className="mt-6 w-full bg-green-600 text-white py-2 rounded"
                >
                  Tandai Sudah Diambil
                </button>
              )}
            </div>
          </div>
        )}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastClassName="bg-white text-gray-800 shadow-md rounded-lg px-4 py-3"
          bodyClassName="text-sm font-medium bg-gray-800"
        />
      </WithRole>
    </div>
  );
}
