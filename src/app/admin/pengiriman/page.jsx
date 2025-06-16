"use client";

import { useEffect, useState } from "react";
import { EllipsisVertical, Printer, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handlePrintPDF } from "../../../utils/printPengirimanNota";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminPengirimanPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPickupDate, setSelectedPickupDate] = useState("");

  const [selectedKurir, setSelectedKurir] = useState("");
  const [kurirList, setKurirList] = useState([]);
  const [filterJenis, setFilterJenis] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [transaksiDetail, setTransaksiDetail] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  const fetchPengiriman = async () => {
    try {
      const res = await fetch("/api/pengiriman/aturjadwal");
      const data = await res.json();
      setTransaksiList(Array.isArray(data.pengiriman) ? data.pengiriman : []);
    } catch (err) {
      console.error("Gagal fetch data pengiriman:", err);
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

  const handleCancelIfLate = async (id_transaksi) => {
    try {
      const res = await fetch(`/api/transaksi/${id_transaksi}/cancel-if-late`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal membatalkan transaksi.");
      } else {
        toast.success(
          data.message || "Transaksi dibatalkan & barang jadi donasi."
        );
        setShowSidebar(false);
        fetchPengiriman();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat membatalkan transaksi.");
    }
  };

  useEffect(() => {
    fetchPengiriman();
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

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const getJenisStyle = (jenis) => {
    switch (jenis) {
      case "COURIER":
        return "bg-purple-100 text-purple-800";
      case "SELF_PICKUP":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getJenisLabel = (jenis) => {
    switch (jenis) {
      case "COURIER":
        return "Kurir";
      case "SELF_PICKUP":
        return "Ambil Sendiri";
      default:
        return jenis;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DALAM PROSES":
        return "bg-gray-100 text-gray-800";
      case "BUTUH KURIR":
        return "bg-yellow-100 text-yellow-800";
      case "ATUR TANGGAL KIRIM":
        return "bg-yellow-100 text-yellow-800";
      case "ATUR JADWAL AMBIL":
        return "bg-yellow-100 text-yellow-800";
      case "KIRIM KURIR":
        return "bg-orange-100 text-orange-800";
      case "SEDANG DIKIRIM":
        return "bg-cyan-100 text-cyan-800";
      case "BISA DIAMBIL":
        return "bg-blue-100 text-blue-800";
      case "SELESAI":
        return "bg-green-100 text-green-800";
      case "GAGAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (item) => {
    if (
      item.status_pengiriman === "IN_PROGRESS" &&
      item.status_pembayaran === "CONFIRMED"
    ) {
      if (item.jenis_pengiriman === "COURIER") {
        if (!item.nama_kurir) {
          return "BUTUH KURIR";
        }
        if (!item.tanggal_kirim) {
          return "ATUR TANGGAL KIRIM";
        }
        if (item.tanggal_kirim && item.nama_kurir) {
          return "KIRIM KURIR";
        }
      }

      if (item.jenis_pengiriman === "SELF_PICKUP") {
        return "ATUR JADWAL AMBIL";
      }
    }

    switch (item.status_pengiriman) {
      case "IN_PROGRESS":
        return "MENUNGGU PEMBAYARAN";
      case "IN_DELIVERY":
        return "SEDANG DIKIRIM";
      case "PICKED_UP":
        return "BISA DIAMBIL";
      case "DONE":
        return "SELESAI";
      case "FAILED":
        return "GAGAL";
      default:
        return item.status_pengiriman;
    }
  };

  const getPengirimanMin = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // set ke awal hari ini
    const offset = now.getTimezoneOffset();
    const localISO = new Date(now.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 16);
    return localISO;
  };
  
  const handleDetailClick = async (transaksi) => {
    setSelectedTransaksi(transaksi);
    setSelectedDate("");
    setSelectedKurir("");

    try {
      const [kurirRes, detailRes] = await Promise.all([
        fetch(`/api/pengiriman/aturjadwal/${transaksi.id_pengiriman}/kurir`),
        fetch(`/api/pengiriman/${transaksi.id_pengiriman}`),
      ]);

      const kurirData = await kurirRes.json();
      const detailData = await detailRes.json();

      if (kurirRes.ok) setKurirList(kurirData.kurir);
      if (detailRes.ok) {
        setTransaksiDetail(detailData.transaksi);
        setShowSidebar(true);
      }
    } catch (err) {
      console.error("Gagal fetch kurir atau detail:", err);
    }
  };

  const handleFinish = async (id_pengiriman) => {
    try {
      const res = await fetch(`/api/pengiriman/${id_pengiriman}/done`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Gagal menyelesaikan pengiriman");

      toast.success("Pengiriman berhasil diselesaikan!");
      fetchPengiriman();
    } catch (err) {
      console.error("Gagal menyelesaikan pengiriman:", err);
      toast.error("Terjadi kesalahan saat menyelesaikan pengiriman");
    }
  };

  const handleAturJadwalAmbil = async () => {
    if (!selectedPickupDate) return toast.error("Tanggal ambil harus diisi.");

    const selected = new Date(selectedPickupDate);
    const now = new Date();

    if (selected < new Date(now.setHours(0, 0, 0, 0))) {
      toast.error("Tanggal pengambilan tidak boleh di masa lalu.");
      return;
    }

    const isSameDay = selected.toDateString() === new Date().toDateString();
    const currentHour = new Date().getHours();
    if (isSameDay && currentHour >= 16) {
      toast.error(
        "Sudah lewat jam 4 sore. Pengambilan tidak bisa dilakukan hari ini."
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/pengiriman/aturjadwal/${selectedTransaksi.id_pengiriman}/jadwal-ambil`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tanggal_kirim: selectedPickupDate }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengatur jadwal ambil.");
        return;
      }

      toast.success("Jadwal pengambilan berhasil diatur.");
      setShowSidebar(false);
      fetchPengiriman();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengatur jadwal ambil.");
    }
  };

  const handlePenjadwalanKurir = async () => {
    if (!selectedDate) return toast.error("Tanggal wajib diisi.");

    const selected = new Date(selectedDate);
    const now = new Date();

    const isSameDay = selected.toDateString() === now.toDateString();
    const currentHour = new Date().getHours();
    if (isSameDay && currentHour >= 16) {
      toast.error(
        "Sudah lewat jam 4 sore. Jadwal hari ini tidak diperbolehkan."
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/pengiriman/aturjadwal/${selectedTransaksi.id_pengiriman}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tanggal_kirim: selectedDate,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengatur jadwal kirim.");
        return;
      }

      toast.success("Jadwal pengiriman berhasil diatur.");
      setShowSidebar(false);
      fetchPengiriman();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengatur jadwal kirim.");
    }
  };

  const handlePilihKurir = async () => {
    if (!selectedKurir) return toast.error("Kurir wajib dipilih.");

    try {
      const res = await fetch(
        `/api/pengiriman/aturjadwal/${selectedTransaksi.id_pengiriman}/kurir`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_kurir: selectedKurir }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.error || "Gagal menetapkan kurir.");
      }

      toast.success("Kurir berhasil ditetapkan dan pengiriman dimulai.");
      setShowSidebar(false);
      fetchPengiriman();
    } catch (err) {
      console.error("Gagal menetapkan kurir:", err);
      toast.error("Terjadi kesalahan saat menetapkan kurir.");
    }
  };

  const handleKirimKurir = async (id_pengiriman) => {
    try {
      const res = await fetch(`/api/pengiriman/aturjadwal/${id_pengiriman}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengirim kurir.");
        return;
      }

      toast.success("Kurir dalam perjalanan");
      fetchPengiriman();
      setShowSidebar(false);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Terjadi kesalahan saat mengirim kurir.");
    }
  };

  const handleDelete = async (id_pengiriman) => {
    if (!id_pengiriman) return;

    const konfirmasi = window.confirm(
      "Yakin ingin membatalkan pengiriman ini?"
    );
    if (!konfirmasi) return;

    try {
      const res = await fetch(`/api/pengiriman/aturjadwal/${id_pengiriman}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Pengiriman dibatalkan.");
        setShowSidebar(false);
        fetchPengiriman();
      } else {
        alert(data.error || "Gagal membatalkan pengiriman.");
      }
    } catch (err) {
      console.error("handleDelete error:", err);
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  const statusOptions = [
    { label: "Semua", value: "ALL" },
    { label: "Butuh Kurir", value: "BUTUH KURIR" },
    { label: "Atur Tanggal Kirim", value: "ATUR TANGGAL KIRIM" },
    { label: "Atur Jadwal Ambil", value: "ATUR JADWAL AMBIL" },
    { label: "Kirim Kurir", value: "KIRIM KURIR" },
    { label: "Sedang Dikirim", value: "SEDANG DIKIRIM" },
    { label: "Bisa Diambil", value: "BISA DIAMBIL" },
    { label: "Selesai", value: "SELESAI" },
    { label: "Gagal", value: "GAGAL" },
  ];

  const handleSetDone = async (id) => {
    try {
      await fetch(`/api/pengiriman/${id}/done`, { method: "PATCH" });
      fetchPengiriman();
      toast.success("Jadwal pengambilan berhasil diatur.");
    } catch (err) {
      toast.error("Gagal update status");
    } finally {
      setShowSidebar(false);
    }
  };

  const filteredList = transaksiList.filter((item) => {
    const matchJenis =
      filterJenis === "ALL" || item.jenis_pengiriman === filterJenis;
    const matchStatus =
      statusFilter === "ALL" || getStatusLabel(item) === statusFilter;
    return matchJenis && matchStatus;
  });

  return (
    <div className="p-6">
      <h1 className="text-4xl font-[Montage-Demo] mb-4">
        Manajemen Pengiriman
      </h1>

      <div className="flex flex-col justify-between gap-3 mb-4">
        <div>
          <Tabs defaultValue="ALL">
            <TabsList className="flex gap-4 w-full bg-white shadow-none">
              {statusOptions.map(({ label, value }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  onClick={() => setStatusFilter(value)}
                  className="flex-1 text-center rounded-none border-transparent border-b-2 data-[state=active]:border-b-blue-600 data-[state=active]:shadow-none "
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="ALL">Semua Pengiriman</option>
            <option value="COURIER">COURIER</option>
            <option value="SELF_PICKUP">SELF PICKUP</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="inline-grid grid-cols-[100px_180px_160px_160px_160px_110px_140px_100px] gap-2 text-white p-4 rounded-xl font-semibold text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
          <div>Nota</div>
          <div>Nama Kurir</div>
          <div>Tanggal Pesan</div>
          <div>Tanggal Kirim/Ambil</div>
          <div>Tanggal Terima</div>
          <div>Jenis</div>
          <div>Status</div>
          <div className="flex justify-center">Action</div>
        </div>

        {[...filteredList]
          .sort((a, b) => {
            const priority = {
              "BUTUH KURIR": 1,
              "ATUR TANGGAL KIRIM": 2,
              "ATUR JADWAL AMBIL": 3,
              "KIRIM KURIR": 4,
              "BISA DIAMBIL": 6,
              "SEDANG DIKIRIM": 5,
              "DALAM PROSES": 0,
              "MENUNGGU PEMBAYARAN": 0,
              SELESAI: 7,
              GAGAL: 8,
            };

            const labelA = getStatusLabel(a);
            const labelB = getStatusLabel(b);
            const rankA = priority[labelA] || 99;
            const rankB = priority[labelB] || 99;

            return rankA - rankB;
          })

          .map((item) => (
            <div
              key={item.id_pengiriman || `${item.no_nota}-${item.nama_pembeli}`}
              className="inline-grid grid-cols-[100px_180px_160px_160px_160px_110px_140px_100px] gap-2 px-4 py-2 mt-3 rounded-xl border border-black text-sm"
            >
              <div className="truncate flex items-center">{item.no_nota}</div>
              <div className="truncate flex items-center">
                {item.jenis_pengiriman === "SELF_PICKUP"
                  ? "-"
                  : item.nama_kurir}
              </div>
              <div className="flex items-center">
                {formatDateTime(item.tanggal_pesan)}
              </div>
              <div className="flex items-center">
                {item.tanggal_kirim ? formatDateTime(item.tanggal_kirim) : "-"}
              </div>
              <div className="flex items-center">
                {item.tanggal_terima
                  ? formatDateTime(item.tanggal_terima)
                  : "-"}
              </div>
              <div
                className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getJenisStyle(
                  item.jenis_pengiriman
                )}`}
              >
                {getJenisLabel(item.jenis_pengiriman)}
              </div>
              <div
                className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                  getStatusLabel(item)
                )}`}
              >
                {getStatusLabel(item)}
              </div>
              <div className="relative flex justify-center items-center">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === item.id_pengiriman
                        ? null
                        : item.id_pengiriman
                    )
                  }
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <EllipsisVertical />
                </button>
                {activeDropdown === item.id_pengiriman && (
                  <div className="absolute dropdown-action left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                    <button
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => handleDetailClick(item)}
                    >
                      Lihat Detail
                    </button>
                    {item.status_pengiriman === "IN_PROGRESS" &&
                      item.tanggal_kirim &&
                      item.nama_kurir && (
                        <button
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => handleKirimKurir(item.id_pengiriman)}
                        >
                          Kirim Kurir
                        </button>
                      )}
                    {(item.status_pengiriman === "IN_DELIVERY" ||
                      item.status_pengiriman === "PICKED_UP") && (
                      <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleFinish(item.id_pengiriman)}
                      >
                        Selesaikan Pengiriman
                      </button>
                    )}
                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => handleDelete(item.id_pengiriman)}
                    >
                      Batalkan Pengiriman
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {showSidebar && selectedTransaksi && transaksiDetail && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-50">
          <div className="bg-white w-full h-full max-w-2xl overflow-auto">
            <div className="sticky top-0 left-0 right-0 z-20 px-6 py-4 flex justify-between items-center bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <h2 className="text-xl font-bold text-white">Detail Transaksi</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-white hover:text-red-500 transition-colors"
              >
                <X />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="justify-center text-indigo-900 text-3xl font-normal font-['Montage'] cursor-pointer">
                    Ceritanya Logo
                  </div>
                  <p className="text-sm">
                    Jl. Green Eco Park No. 456 Yogyakarta
                  </p>
                </div>

                <hr className="my-2" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="font-semibold">No Nota:</div>
                  <div>{transaksiDetail.no_nota}</div>

                  <div className="font-semibold">Tanggal Pesan:</div>
                  <div>{formatDateTime(transaksiDetail.tanggal_pesan)}</div>

                  <div className="font-semibold">Lunas pada:</div>
                  <div>{formatDateTime(transaksiDetail.tanggal_lunas)}</div>

                  <div className="font-semibold">
                    {transaksiDetail.jenis_pengiriman === "COURIER"
                      ? "Tanggal Kirim"
                      : "Tanggal Ambil"}
                    :
                  </div>
                  <div>
                    {transaksiDetail.jenis_pengiriman === "COURIER"
                      ? transaksiDetail.tanggal_kirim
                        ? formatDateTime(transaksiDetail.tanggal_kirim)
                        : "-"
                      : transaksiDetail.tanggal_terima
                      ? formatDateTime(transaksiDetail.tanggal_terima)
                      : "-"}
                  </div>
                </div>

                <hr className="my-2" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="font-semibold">Pembeli:</div>
                  <div>
                    {transaksiDetail.email_pembeli} /{" "}
                    {transaksiDetail.nama_pembeli}
                  </div>

                  <div className="font-semibold">Alamat:</div>
                  <div>{transaksiDetail.alamat_pembeli || "-"}</div>

                  <div className="font-semibold">Delivery:</div>
                  <div>
                    {transaksiDetail.jenis_pengiriman === "COURIER" ? (
                      `Kurir ReUseMart (${transaksiDetail.nama_kurir || "-"})`
                    ) : (
                      <em>Diambil sendiri</em>
                    )}
                  </div>
                </div>

                <hr className="my-2" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="font-semibold">Total:</div>
                  <div>
                    {formatRupiah(Number(transaksiDetail.harga_awal || 0))}
                  </div>

                  <div className="font-semibold">Ongkos Kirim:</div>
                  <div>
                    {formatRupiah(Number(transaksiDetail.ongkos_kirim || 0))}
                  </div>

                  <div className="font-semibold">Total Bayar:</div>
                  <div className="font-bold">
                    {formatRupiah(transaksiDetail.harga_akhir)}
                  </div>

                  {Number(transaksiDetail.diskon || 0) > 0 && (
                    <>
                      <div className="font-semibold">
                        Potongan {Number(transaksiDetail.diskon) / 10000} poin:
                      </div>
                      <div>-{formatRupiah(transaksiDetail.diskon)}</div>
                    </>
                  )}

                  <div className="font-semibold">Poin dari pesanan ini:</div>
                  <div>{transaksiDetail.tambahan_poin || "-"}</div>

                  <div className="font-semibold">Total poin customer:</div>
                  <div>{transaksiDetail.poin_loyalitas || "-"}</div>

                  <div className="font-semibold">
                    Pembayaran diverifikasi oleh:
                  </div>
                  <div>
                    {transaksiDetail.nama_petugas_cs || "-"} (
                    {transaksiDetail.kode_petugas || "-"})
                  </div>
                </div>

                <hr className="my-2" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="font-semibold">Tanggal Diterima:</div>
                  <div>
                    {transaksiDetail.tanggal_terima
                      ? formatDateTime(transaksiDetail.tanggal_terima)
                      : "-"}
                  </div>
                </div>
              </div>

              <hr className="my-2" />

              <button
                onClick={() =>
                  handlePrintPDF(transaksiDetail, formatRupiah, formatDateTime)
                }
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              >
                <Printer size={16} /> Cetak PDF
              </button>

              {/* Atur Kurir Dulu*/}
              {selectedTransaksi.jenis_pengiriman === "COURIER" &&
                selectedTransaksi.status_pembayaran === "CONFIRMED" &&
                getStatusLabel(selectedTransaksi) === "BUTUH KURIR" && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Kurir
                    </label>
                    <select
                      value={selectedKurir}
                      onChange={(e) => setSelectedKurir(e.target.value)}
                      className="w-full border px-3 py-2 rounded mb-3"
                    >
                      <option value="">-- Pilih Kurir --</option>
                      {kurirList.map((kurir) => (
                        <option key={kurir.id_pegawai} value={kurir.id_pegawai}>
                          {kurir.nama}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handlePilihKurir}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                      Simpan Kurir
                    </button>
                  </div>
                )}

              {/* Lalu Atur Jadwal Kirim*/}
              {selectedTransaksi.jenis_pengiriman === "COURIER" &&
                selectedTransaksi.status_pembayaran === "CONFIRMED" &&
                getStatusLabel(selectedTransaksi) === "ATUR TANGGAL KIRIM" && (
                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Atur Tanggal Kirim
                    </label>
                    <input
                      type="datetime-local"
                      value={selectedDate}
                      min={getPengirimanMin()}
                      max={(() => {
                        const maxDate = new Date(transaksiDetail.tanggal_lunas);
                        maxDate.setDate(maxDate.getDate() + 9);
                        return new Date(
                          maxDate.getTime() -
                            maxDate.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16);
                      })()}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border px-3 py-2 rounded mb-3"
                    />
                    <button
                      onClick={handlePenjadwalanKurir}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                      Simpan Tanggal Kirim
                    </button>
                  </div>
                )}

              {selectedTransaksi.jenis_pengiriman === "COURIER" &&
                selectedTransaksi.status_pengiriman === "IN_PROGRESS" &&
                selectedTransaksi.status_pembayaran === "CONFIRMED" &&
                selectedTransaksi.tanggal_kirim &&
                selectedTransaksi.nama_kurir && (
                  <button
                    onClick={() =>
                      handleKirimKurir(selectedTransaksi.id_pengiriman)
                    }
                    className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded"
                  >
                    Kirim Kurir
                  </button>
                )}

              {selectedTransaksi.jenis_pengiriman === "SELF_PICKUP" &&
                selectedTransaksi.status_pengiriman === "IN_PROGRESS" &&
                selectedTransaksi.status_pembayaran === "CONFIRMED" && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Atur Jadwal Pengambilan
                    </label>
                    <input
                      type="datetime-local"
                      value={selectedPickupDate}
                      min={getPengirimanMin()}
                      max={(() => {
                        const maxDate = new Date(transaksiDetail.tanggal_lunas);
                        maxDate.setDate(maxDate.getDate() + 8);
                        return new Date(
                          maxDate.getTime() -
                            maxDate.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16);
                      })()}
                      onChange={(e) => setSelectedPickupDate(e.target.value)}
                      className="w-full border px-3 py-2 rounded mb-3"
                    />

                    <button
                      onClick={handleAturJadwalAmbil}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                      Simpan Jadwal Ambil
                    </button>
                  </div>
                )}

              {/* Tombol status selesai */}
              {selectedTransaksi.jenis_pengiriman === "COURIER" &&
                getStatusLabel(selectedTransaksi) === "Dalam Pengiriman" && (
                  <button
                    onClick={() =>
                      handleSetDone(selectedTransaksi.id_pengiriman)
                    }
                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Tandai Selesai
                  </button>
                )}

              {selectedTransaksi.jenis_pengiriman === "SELF_PICKUP" &&
                getStatusLabel(selectedTransaksi) === "BISA DIAMBIL" && (
                  <button
                    onClick={() =>
                      handleSetDone(selectedTransaksi.id_pengiriman)
                    }
                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Sudah Diambil
                  </button>
                )}

              {selectedTransaksi.jenis_pengiriman === "SELF_PICKUP" &&
                selectedTransaksi.status_pembayaran === "CONFIRMED" &&
                !selectedTransaksi.tanggal_terima &&
                (() => {
                  const tglLunas = new Date(selectedTransaksi.tanggal_lunas);
                  const now = new Date();
                  const selisih = Math.floor(
                    (now - tglLunas) / (1000 * 60 * 60 * 24)
                  );
                  return selisih > 2;
                })() && (
                  <button
                    onClick={() =>
                      handleCancelIfLate(selectedTransaksi.id_transaksi)
                    }
                    className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Batalkan & Tandai Donasi
                  </button>
                )}
            </div>
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
    </div>
  );
}
