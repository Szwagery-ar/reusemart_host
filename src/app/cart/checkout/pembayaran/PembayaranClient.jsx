"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PembayaranPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_transaksi = searchParams.get("id_transaksi");

  const [transaksi, setTransaksi] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (isUploaded) return;
    if (timeLeft <= 0) {
      fetch(`/api/transaksi/${id_transaksi}/batal`, {
        method: "PATCH",
      }).then(() => {
        alert("Waktu habis! Transaksi dibatalkan otomatis.");
        router.push("/profile/riwayat");
      });
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isUploaded, id_transaksi, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/transaksi/${id_transaksi}`);
        const data = await res.json();
        if (res.ok) setTransaksi(data.transaksi);
      } catch (error) {
        console.error("Gagal mengambil data transaksi", error);
      }
    };

    fetchData();
  }, [id_transaksi]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Pilih file bukti pembayaran dulu!");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("id_transaksi", id_transaksi);

    const uploadRes = await fetch("/api/pembayaran/upload", {
      method: "PUT",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errMsg = await uploadRes.text();
      console.error("Upload gagal:", errMsg);
      return alert("Gagal mengupload bukti pembayaran.");
    }

    const uploadData = await uploadRes.json();

    alert("Bukti pembayaran berhasil dikirim!");
    setIsUploaded(true);
    router.push("/profile/riwayat");
  };

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!transaksi) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 md:p-12 bg-[#EDF6FF] min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Upload Bukti Pembayaran</h1>

      <div className="bg-white p-6 rounded shadow-md space-y-4">
        <p className="text-gray-600">
          Harap unggah bukti pembayaran dalam waktu{" "}
          <strong>{formatTimer(timeLeft)}</strong> menit sebelum transaksi
          dibatalkan.
        </p>
        <p>
          Total yang harus dibayar:{" "}
          <strong>{formatRupiah(transaksi.harga_akhir)}</strong>
        </p>

        <input type="file" accept="image/*" onChange={handleFileChange} />
        {imagePreview && (
          <div className="mt-4">
            <Image
              src={imagePreview}
              alt="Preview"
              width={300}
              height={300}
              className="rounded shadow"
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold"
        >
          Kirim Bukti Pembayaran
        </button>
      </div>
    </div>
  );
}
