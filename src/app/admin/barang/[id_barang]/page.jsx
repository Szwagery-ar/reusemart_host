"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReuseButton from "@/components/ReuseButton/ReuseButton";

export default function DetailBarangAdminPage() {
  const { id_barang } = useParams();
  const router = useRouter();

  const [barang, setBarang] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [uniqueImages, setUniqueImages] = useState([]);

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch(`/api/barang/${id_barang}`);
        const data = await res.json();
        setBarang(data.barang);

        if (data.barang && data.barang.gambar_barang.length > 0) {
          setPreviewImg(data.barang.gambar_barang[0].src_img);
          const uniqueImgs = Array.from(
            new Set(data.barang.gambar_barang.map((item) => item.src_img))
          ).map((src_img) =>
            data.barang.gambar_barang.find((item) => item.src_img === src_img)
          );
          setUniqueImages(uniqueImgs);
        }
      } catch (err) {
        console.error("Gagal memuat barang:", err);
      }
    };

    fetchBarang();
  }, [id_barang]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (!barang) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Kembali
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img
            src={previewImg || "/images/default-image.jpg"}
            alt={barang.nama_barang}
            className="w-full h-[400px] object-cover rounded-xl mb-4"
          />

          <div className="flex gap-2">
            {uniqueImages.map((gambar, index) => (
              <img
                key={index}
                src={gambar.src_img}
                onClick={() => setPreviewImg(gambar.src_img)}
                className={`w-20 h-20 object-cover rounded cursor-pointer ${previewImg === gambar.src_img ? "ring-2 ring-indigo-600" : ""}`}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{barang.nama_barang}</h1>
          <p className="text-lg font-semibold text-indigo-700 mb-4">
            Rp{parseInt(barang.harga_barang).toLocaleString("id-ID")}
          </p>

          <div className="grid gap-2 text-sm">
            <p><strong>Kode Produk:</strong> {barang.kode_produk}</p>
            <p><strong>Status Titip:</strong> {barang.status_titip}</p>
            <p><strong>Garansi:</strong> {barang.tanggal_garansi ? formatDate(barang.tanggal_garansi) : '-'}</p>
            <p><strong>Tanggal Masuk:</strong> {formatDate(barang.tanggal_masuk)}</p>
            <p><strong>Tanggal Keluar:</strong> {barang.tanggal_keluar ? formatDate(barang.tanggal_keluar) : '-'}</p>
            <p><strong>Penitip:</strong> {barang.id_penitip ? `P${barang.id_penitip} - ${barang.penitip_name}` : barang.penitip_name}</p>
            <p><strong>Deskripsi:</strong></p>
            <div className="text-sm whitespace-pre-line leading-relaxed">
                {barang.deskripsi_barang || 'Tidak ada deskripsi.'}
            </div>



          </div>

          {/* <div className="mt-6">
            <h2 className="font-semibold mb-2">Deskripsi Barang</h2>
            <p className="text-sm whitespace-pre-line bg-gray-50 p-3 rounded border">
              {barang.deskripsi_barang || '-'}
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
