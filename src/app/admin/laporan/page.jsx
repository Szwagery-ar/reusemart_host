"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPage() {
  const [penjualan, setPenjualan] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [barangDonasiList, setBarangDonasiList] = useState([]);
  const [requestDonasiList, setRequestDonasiList] = useState([]);
  const [komisiBarangList, setKomisiBarangList] = useState([]);
  const [transaksiPenitipList, setTransaksiPenitipList] = useState([]);
  const [penitipList, setPenitipList] = useState([]);
  const [selectedPenitip, setSelectedPenitip] = useState(null);
  const [filterNamaPenitip, setFilterNamaPenitip] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [filterBulanKomisi, setFilterBulanKomisi] = useState("");
  const [filterTahunKomisi, setFilterTahunKomisi] = useState("");
  const [filterTahunDonasi, setFilterTahunDonasi] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const monthOptions = [
    { value: "ALL", label: "Semua Bulan" },
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  // Modular fetchers
  const fetchPenjualan = async () => {
    const res = await fetch("/api/laporan/penjualan");
    const data = await res.json();
    setPenjualan(data);
  };

  const fetchExpired = async () => {
    const res = await fetch("/api/laporan/penitipan-expired");
    const data = await res.json();
    setExpiredItems(data);
  };

  const fetchKomisiBarang = async () => {
    const res = await fetch("/api/laporan/komisi-produk");
    const json = await res.json();

    setKomisiBarangList(
      json.success && Array.isArray(json.data) ? json.data : []
    );
  };

  const fetchBarangDonasi = async () => {
    const res = await fetch("/api/laporan/donasi-barang");
    const data = await res.json();
    setBarangDonasiList(data);
  };

  const fetchRequestDonasi = async () => {
    const res = await fetch("/api/laporan/request-donasi");
    const json = await res.json();
    setRequestDonasiList(
      json.success && Array.isArray(json.data) ? json.data : []
    );
  };

  const fetchPenitipList = async () => {
    try {
      const res = await fetch("/api/penitip");
      const data = await res.json();

      if (Array.isArray(data.penitip)) {
        setPenitipList(data.penitip);

        if (data.penitip.length > 0) {
          fetchTransaksiPenitipById(data.penitip[0].id_penitip);
          setFilterNamaPenitip(data.penitip[0].id_penitip);
        }
      } else {
        console.warn("Data penitip bukan array:", data);
        setPenitipList([]);
      }
    } catch (err) {
      console.error("Gagal fetch daftar penitip:", err);
      setPenitipList([]);
    }
  };

  const fetchTransaksiPenitipById = async (id_penitip) => {
    try {
      const res = await fetch(`/api/laporan/transaksi-penitip/${id_penitip}`);
      const data = await res.json();

      console.log("🔍 Response transaksi penitip:", data);

      if (data.success) {
        setTransaksiPenitipList(data.items || []);
        setSelectedPenitip({ id: data.id_penitip, nama: data.nama_penitip });
      } else {
        console.warn("⚠️ Tidak ada data transaksi:", data);
        setTransaksiPenitipList([]);
        setSelectedPenitip(null);
      }
    } catch (err) {
      console.error("❌ Gagal fetch transaksi penitip:", err);
    }
  };

  // Master fetch loader
  useEffect(() => {
    fetchPenjualan();
    fetchExpired();
    fetchKomisiBarang();
    fetchBarangDonasi();
    fetchRequestDonasi();
    fetchPenitipList();
  }, []);

  const generatePDFExpired = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Header
    doc.setFontSize(12);
    doc.text("ReUse Mart", 14, 14);
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
    doc.setFontSize(14);
    doc.text("LAPORAN REQUEST DONASI", 14, 30);
    doc.setFontSize(12);
    doc.text(`Tanggal cetak: ${today}`, 14, 38);

    autoTable(doc, {
      startY: 50,
      head: [["Nama Barang", "Penitip", "Masuk", "Expire", "Status"]],
      body: expiredItems.map((b) => [
        b.nama_barang,
        b.nama_penitip,
        b.tanggal_masuk,
        b.tanggal_expire,
        b.status,
      ]),
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });
    doc.save("Laporan_Penitipan_Expired.pdf");
  };

  const generatePDFKomisiPerProduk = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const bulanIndo = [
      "", // padding agar index 1 = Januari
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const namaBulanCetak =
      filterBulanKomisi && parseInt(filterBulanKomisi) >= 1
        ? bulanIndo[parseInt(filterBulanKomisi)]
        : "Semua Bulan";

    const tahunCetak = filterTahunKomisi || "Semua Tahun";

    // Header
    doc.setFontSize(12);
    doc.text("ReUse Mart", 14, 14);
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
    doc.setFontSize(14);
    doc.text("LAPORAN KOMISI BULANAN PER PRODUK", 14, 30);
    doc.setFontSize(12);
    doc.text(`Bulan: ${namaBulanCetak}`, 14, 38);
    doc.text(`Tahun: ${tahunCetak}`, 14, 44);
    doc.text(`Tanggal Cetak: ${today}`, 14, 50);

    const filteredData = komisiBarangList.filter((item) => {
      const tglLaku = new Date(item.tanggal_laku);
      const month = (tglLaku.getMonth() + 1).toString().padStart(2, "0");
      const year = tglLaku.getFullYear().toString();
      return (
        (!filterBulanKomisi || month === filterBulanKomisi) &&
        (!filterTahunKomisi || year === filterTahunKomisi)
      );
    });

    const tableBody =
      filteredData.length > 0
        ? filteredData.map((item) => [
            item.kode_produk,
            item.nama_produk,
            `Rp ${Number(item.harga_jual).toLocaleString("id-ID")}`,
            item.tanggal_masuk?.split("T")[0],
            item.tanggal_laku?.split("T")[0],
            `Rp ${Number(item.komisi_hunter).toLocaleString("id-ID")}`,
            `Rp ${Number(item.komisi_reusemart).toLocaleString("id-ID")}`,
            `Rp ${Number(item.bonus_penitip).toLocaleString("id-ID")}`,
          ])
        : [
            [
              {
                content: "Tidak ada data pada filter ini",
                colSpan: 8,
                styles: { halign: "center", fontWeight: "bold" },
              },
            ],
          ];

    autoTable(doc, {
      startY: 58,
      head: [
        [
          "Kode Produk",
          "Nama Produk",
          "Harga Jual",
          "Tgl Masuk",
          "Tgl Laku",
          "Komisi Hunter",
          "Komisi ReUseMart",
          "Bonus Penitip",
        ],
      ],
      body: tableBody,
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });

    doc.save("Laporan_Komisi_Produk_Bulanan.pdf");
  };

  const generatePDFBarangDonasi = () => {
    if (barangDonasiList.length === 0) {
      alert("Tidak ada data donasi barang untuk diunduh.");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Header
    doc.setFontSize(12);
    doc.text("ReUse Mart", 14, 14);
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
    doc.setFontSize(14);

    doc.text("LAPORAN DONASI BARANG", 14, 30);
    doc.setFontSize(12);

    const tahunDonasiTeks = filterTahunDonasi
      ? `Tahun : ${filterTahunDonasi}`
      : "Tahun : Semua Tahun";

    doc.text(tahunDonasiTeks, 14, 38);
    doc.text(`Tanggal cetak: ${today}`, 14, 44);

    // Tabel
    const filteredDonasi = barangDonasiList.filter((item) => {
      if (!filterTahunDonasi) return true;
      return (
        new Date(item.tanggal_donasi).getFullYear().toString() ===
        filterTahunDonasi
      );
    });

    const donasiPDFTable =
      filteredDonasi.length > 0
        ? filteredDonasi.map((item) => [
            item.kode_produk,
            item.nama_barang,
            item.id_penitip,
            item.nama_penitip,
            new Date(item.tanggal_donasi).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),

            item.nama_organisasi,
            item.nama_penerima,
          ])
        : [
            [
              {
                content: "Tidak ada data barang didonasikan pada tahun ini",
                colSpan: 8,
                styles: { halign: "center" },
              },
            ],
          ];

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Kode Produk",
          "Nama Produk",
          "ID Penitip",
          "Nama Penitip",
          "Tanggal Donasi",
          "Organisasi",
          "Nama Penerima",
        ],
      ],
      body: donasiPDFTable,
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });

    doc.save("Laporan_Barang_Donasi.pdf");
  };

  const generatePDFRequestDonasi = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Header
    doc.setFontSize(12);
    doc.text("ReUse Mart", 14, 14);
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);
    doc.setFontSize(14);
    doc.text("LAPORAN REQUEST DONASI", 14, 30);
    doc.setFontSize(12);
    doc.text(`Tanggal cetak: ${today}`, 14, 38);

    // Data Tabel
    const requestPDFTable = requestDonasiList.map((item) => [
      item.id_organisasi,
      item.nama_organisasi,
      item.alamat,
      item.request,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["ID Organisasi", "Nama Organisasi", "Alamat", "Request"]],
      body: requestPDFTable,
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
      columnStyles: {
        3: { cellWidth: 80 },
      },
      margin: { left: 10, right: 10 },
    });

    doc.save("Laporan_Request_Donasi.pdf");
  };

  const generatePDFTransaksiPenitip = () => {
    if (!selectedPenitip) return;

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("id-ID");

    const bulanIndo = [
      "", // padding
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const namaBulanCetak =
      filterBulan && parseInt(filterBulan) >= 1
        ? bulanIndo[parseInt(filterBulan)]
        : "Semua Bulan";

    const tahunCetak = filterTahun || "Semua Tahun";

    const filteredData = transaksiPenitipList.filter((item) => {
      const tanggalLaku = new Date(item.tanggal_laku);
      const month = (tanggalLaku.getMonth() + 1).toString().padStart(2, "0");
      const year = tanggalLaku.getFullYear().toString();

      return (
        (!filterBulan || month === filterBulan) &&
        (!filterTahun || year === filterTahun)
      );
    });

    const transaksiPDFTable =
      filteredData.length > 0
        ? filteredData.map((item) => [
            item.kode_produk,
            item.nama_barang,
            item.tanggal_masuk,
            item.tanggal_laku,
            `Rp ${item.harga_jual_bersih.toLocaleString("id-ID")}`,
            `Rp ${item.bonus_terjual_cepat.toLocaleString("id-ID")}`,
            `Rp ${item.pendapatan.toLocaleString("id-ID")}`,
          ])
        : [["Tidak ada data pada filter ini", "", "", "", "", "", ""]];

    doc.setFontSize(12);
    doc.text("ReUse Mart", 14, 14);
    doc.text("Jl. Green Eco Park No. 456 Yogyakarta", 14, 20);

    doc.setFontSize(14);
    doc.text("LAPORAN TRANSAKSI PENITIP", 14, 30);
    doc.setFontSize(12);
    doc.text(`ID Penitip : ${selectedPenitip.id}`, 14, 38);
    doc.text(`Nama Penitip : ${selectedPenitip.nama}`, 14, 44);
    doc.text(`Bulan : ${namaBulanCetak}`, 14, 50);
    doc.text(`Tahun : ${tahunCetak}`, 14, 56);
    doc.text(`Tanggal cetak: ${today}`, 14, 62);

    autoTable(doc, {
      startY: 70,
      head: [
        [
          "Kode Produk",
          "Nama Barang",
          "Tanggal Masuk",
          "Tanggal Laku",
          "Harga Jual Bersih",
          "Bonus Terjual Cepat",
          "Pendapatan",
        ],
      ],
      body: transaksiPDFTable,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`Laporan_Transaksi_Penitip_${selectedPenitip.nama}.pdf`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📊 Laporan</h1>

      <hr className="my-8 border-gray-300" />
      {/* Laporan komisi bulanan per produk */}
      <div className="mt-2">
        <h2 className="text-xl font-semibold mb-4">
          Laporan Komisi Bulanan Per Produk
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={generatePDFKomisiPerProduk}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          >
            Unduh PDF
          </button>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bulan (01–12)
            </label>
            <select
              className="border px-3 py-2 rounded text-sm w-full"
              value={filterBulanKomisi}
              onChange={(e) => setFilterBulanKomisi(e.target.value)}
            >
              <option value="">-- Pilih Bulan --</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tahun
            </label>
            <input
              type="number"
              placeholder="Contoh: 2025"
              className="border px-3 py-2 rounded text-sm w-full"
              value={filterTahunKomisi}
              onChange={(e) => setFilterTahunKomisi(e.target.value)}
            />
          </div>
        </div>
        <table className="mt-4 w-full border text-sm">
          <thead>
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">Kode Produk</th>
              <th className="px-5 py-3 text-white text-left">Nama Produk</th>
              <th className="px-5 py-3 text-white text-left">Harga Jual</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Masuk</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Laku</th>
              <th className="px-5 py-3 text-white text-left">Komisi Hunter</th>
              <th className="px-5 py-3 text-white text-left">
                Komisi ReUseMart
              </th>
              <th className="px-5 py-3 text-white text-left">Bonus Penitip</th>
            </tr>
          </thead>
          <tbody>
            {komisiBarangList
              .filter((item) => {
                const tglLaku = new Date(item.tanggal_laku);
                const month = (tglLaku.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const year = tglLaku.getFullYear().toString();
                return (
                  (!filterBulanKomisi || month === filterBulanKomisi) &&
                  (!filterTahunKomisi || year === filterTahunKomisi)
                );
              })
              .map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="text-left px-5 py-2">{item.kode_produk}</td>
                  <td className="text-left px-5 py-2">{item.nama_produk}</td>
                  <td className="text-left px-5 py-2">
                    Rp {Number(item.harga_jual).toLocaleString("id-ID")}
                  </td>
                  <td className="text-left px-5 py-2">
                    {item.tanggal_masuk?.split("T")[0]}
                  </td>
                  <td className="text-left px-5 py-2">
                    {item.tanggal_laku?.split("T")[0]}
                  </td>
                  <td className="text-left px-5 py-2">
                    Rp {Number(item.komisi_hunter).toLocaleString("id-ID")}
                  </td>
                  <td className="text-left px-5 py-2">
                    Rp {Number(item.komisi_reusemart).toLocaleString("id-ID")}
                  </td>
                  <td className="text-left px-5 py-2">
                    Rp {Number(item.bonus_penitip).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-gray-300" />
      {/* Laporan Barang yang Masa Penitipannya Sudah Habis */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Barang dengan Status Titip Sudah Habis
        </h2>
        <button
          onClick={generatePDFExpired}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Unduh PDF
        </button>
        <table className="mt-4 w-full border text-sm">
          <thead>
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">Kode Produk</th>
              <th className="px-5 py-3 text-white text-left">Nama Barang</th>
              <th className="px-5 py-3 text-white text-left">Penitip</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Masuk</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Expire</th>
              <th className="px-5 py-3 text-white text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {expiredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-3 text-gray-500">
                  Tidak ada barang yang status titipnya habis.
                </td>
              </tr>
            ) : (
              expiredItems.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="text-left px-5 py-2">{item.kode_produk}</td>
                  <td className="text-left px-5 py-2">{item.nama_barang}</td>
                  <td className="text-left px-5 py-2">{item.nama_penitip}</td>
                  <td className="text-left px-5 py-2">
                    {item.tanggal_masuk?.split("T")[0]}
                  </td>
                  <td className="text-left px-5 py-2">
                    {item.tanggal_expire?.split("T")[0]}
                  </td>
                  <td className="text-left px-5 py-2">{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-gray-300" />
      {/* Donasi Barang */}
      <div className="mt-2">
        <h2 className="text-xl font-semibold mb-4">Laporan Donasi Barang</h2>
        <div className="flex items-center gap-4 mb-4 mt-2">
          <button
            onClick={generatePDFBarangDonasi}
            className="px-4 py-2 bg-cyan-600 text-white rounded cursor-pointer"
          >
            Unduh PDF
          </button>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tahun Donasi
            </label>
            <input
              type="number"
              placeholder="Contoh: 2025"
              className="border px-3 py-2 rounded text-sm w-full"
              value={filterTahunDonasi}
              onChange={(e) => setFilterTahunDonasi(e.target.value)}
            />
          </div>
        </div>
        <table className="mt-4 w-full border text-sm">
          <thead>
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">Kode Produk</th>
              <th className="px-5 py-3 text-white text-left">Nama Produk</th>
              <th className="px-5 py-3 text-white text-left">ID Penitip</th>
              <th className="px-5 py-3 text-white text-left">Nama Penitip</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Donasi</th>
              <th className="px-5 py-3 text-white text-left">Organisasi</th>
              <th className="px-5 py-3 text-white text-left">Nama Penerima</th>
            </tr>
          </thead>
          <tbody>
            {barangDonasiList
              .filter((item) => {
                if (!filterTahunDonasi) return true;
                return (
                  new Date(item.tanggal_donasi).getFullYear().toString() ===
                  filterTahunDonasi
                );
              })
              .map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="text-left px-5 py-2">{item.kode_produk}</td>
                  <td className="text-left px-5 py-2">{item.nama_barang}</td>
                  <td className="text-left px-5 py-2">{item.id_penitip}</td>
                  <td className="text-left px-5 py-2">{item.nama_penitip}</td>
                  <td className="text-left px-5 py-2">{item.tanggal_donasi}</td>
                  <td className="text-left px-5 py-2">
                    {item.nama_organisasi}
                  </td>
                  <td className="text-left px-5 py-2">{item.nama_penerima}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Laporan Request Donasi */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Laporan Request Donasi</h2>
        <button
          onClick={generatePDFRequestDonasi}
          className="px-4 py-2 bg-cyan-600 text-white rounded cursor-pointer"
        >
          Unduh PDF
        </button>
        <table className="mt-4 w-full border text-sm">
          <thead>
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">ID Organisasi</th>
              <th className="px-5 py-3 text-white text-left">Nama</th>
              <th className="px-5 py-3 text-white text-left">Alamat</th>
              <th className="px-5 py-3 text-white text-left">Request</th>
            </tr>
          </thead>
          <tbody>
            {requestDonasiList.map((item, idx) => (
              <tr key={idx} className="text-center">
                <td className="text-left px-5 py-2">{item.id_organisasi}</td>
                <td className="text-left px-5 py-2">{item.nama_organisasi}</td>
                <td className="text-left px-5 py-2">{item.alamat}</td>
                <td className="text-left px-5 py-2">{item.request}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Laporan Transaksi Penitip */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Laporan Transaksi Penitip
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={generatePDFTransaksiPenitip}
            className="px-4 py-2 bg-cyan-600 text-white rounded cursor-pointer"
          >
            Unduh PDF
          </button>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bulan
            </label>
            <select
              className="border px-3 py-2 rounded text-sm w-full"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option value="">-- Pilih Bulan --</option>
              {monthOptions.slice(1).map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pilih Penitip
            </label>
            <select
              className="border px-3 py-2 rounded text-sm w-full"
              value={filterNamaPenitip}
              onChange={(e) => {
                setFilterNamaPenitip(e.target.value);
                fetchTransaksiPenitipById(e.target.value);
              }}
            >
              <option value="">-- Pilih Penitip --</option>
              {penitipList.map((p) => (
                <option key={p.id_penitip} value={p.id_penitip}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tahun
            </label>
            <input
              type="number"
              placeholder="Contoh: 2024"
              className="border px-3 py-2 rounded text-sm w-full"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
            />
          </div>
        </div>
        <table className="mt-4 w-full border text-sm">
          <thead>
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">Kode Produk</th>
              <th className="px-5 py-3 text-white text-left">Nama Barang</th>
              <th className="px-5 py-3 text-white text-left">Tgl Masuk</th>
              <th className="px-5 py-3 text-white text-left">Tgl Laku</th>
              <th className="px-5 py-3 text-white text-left">
                Harga Jual Bersih
              </th>
              <th className="px-5 py-3 text-white text-left">
                Bonus Terjual Cepat
              </th>
              <th className="px-5 py-3 text-white text-left">Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            {transaksiPenitipList
              .filter((item) => {
                const tanggalLaku = new Date(item.tanggal_laku);
                const month = (tanggalLaku.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const year = tanggalLaku.getFullYear().toString();

                return (
                  (!filterBulan || month === filterBulan) &&
                  (!filterTahun || year === filterTahun)
                );
              })
              .map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="text-left px-5 py-2">{item.kode_produk}</td>
                  <td className="text-left px-5 py-2">{item.nama_barang}</td>
                  <td className="text-left px-5 py-2">
                    {item.tanggal_masuk?.split("T")[0]}
                  </td>
                  <td className="text-left px-5 py-2">
                    {item.tanggal_laku?.split("T")[0]}
                  </td>
                  <td className="text-left px-5 py-2">
                    Rp {item.harga_jual_bersih.toLocaleString("id-ID")}
                  </td>
                  <td className="text-left px-5 py-2">
                    Rp {item.bonus_terjual_cepat.toLocaleString("id-ID")}
                  </td>
                  <td className="text-left px-5 py-2">
                    Rp {item.pendapatan.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
