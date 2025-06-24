"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function Home() {
  const router = useRouter();
  const [barang, setBarang] = useState([]);

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const response = await fetch("/api/barang/recent");
        const data = await response.json();

        setBarang(Array.isArray(data.barang) ? data.barang : []);
      } catch (error) {
        console.error("Error fetching barang:", error);
      }
    };
    fetchBarang();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="">
      <Navbar />
      <div className="px-20 mt-20">
        <div className="flex gap-5 justify-center mt-3">
          <div className="flex-auto rounded-4xl bg-[#220593] relative">
            <div className="absolute bottom-0 left-0 scale-150 origin-bottom-left">
              <img src="/images/Home/Hero.png" alt="Hero" className="" />
            </div>
          </div>
          <div className="py-20 flex-auto bg-[#220593] rounded-4xl">
            <div className="pt-3 ps-10 font-[Montage-Demo] text-white text-9xl">
              CARI <span className="text-[#CDE7FF]">APAPUN</span> <br /> DI
              REUSEMART
            </div>
            <div className="p-3 ms-10 ps-3 text-white font-semibold border-s-5">
              Semua kategori, satu tempat, cari barang bekas berkualitas <br />{" "}
              yang mau kamu bawa pulang
            </div>
          </div>
          <div className="flex flex-row gap-5">
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-[#220593] rounded-4xl overflow-hidden">
                <div className="w-xs">
                  <img src="/images/Home/Guitar.png" alt="" className="" />
                </div>
                <div className="w-xs">
                  <img src="/images/Home/Camera.png" alt="" className="" />
                </div>
              </div>
              <div className="bg-[#220593] rounded-4xl p-4">
                <h5 className="text-white w-50">
                  Langsung cek koleksi barang terbaik kami
                </h5>
                <button className="bg-white px-8 py-3 mt-2 inline-flex gap-5 text-[#220593] rounded-4xl font-semibold">
                  Belanja Sekarang
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-[#220593] rounded-4xl p-3 inline-flex">
            <img
              src="/images/Home/Linear/Tag-Price.png"
              alt="Tag Price"
              className="scale-80"
            />
            <div className="place-content-center">
              <div className="text-white text-3xl font-[Montage-Demo]">
                HARGA YANG RASIONAL
              </div>
              <div className="text-white text-sm mt-3">
                Kamu tetap bisa dapetin barang berkualitas tanpa bikin dompet
                menjerit.
              </div>
            </div>
          </div>
          <div className="bg-[#220593] rounded-4xl p-3 inline-flex">
            <img
              src="/images/Home/Linear/Verified-Check.png"
              alt="Verified Check"
              className="scale-80"
            />
            <div className="place-content-center">
              <div className="text-white text-3xl font-[Montage-Demo]">
                BARANG BEKAS NGGAK ASAL
              </div>
              <div className="text-white text-sm mt-3">
                Semua barang udah di cek — bebas cacat, asli, dan pastinya kece.
              </div>
            </div>
          </div>
          <div className="bg-[#220593] rounded-4xl p-3 inline-flex">
            <img
              src="/images/Home/Linear/Hand-Stars.png"
              alt="Hand Stars"
              className="scale-80"
            />
            <div className="place-content-center">
              <div className="text-white text-3xl font-[Montage-Demo]">
                KEUNTUNGAN MAKSIMAL
              </div>
              <div className="text-white text-sm mt-3">
                Tukar poin dari setiap transaksi jadi diskon atau merchandise
                keren.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-4xl overflow-hidden">
          <img src="/images/Home/Promo-1.png" alt="promo 1" className="" />
        </div>

        <div className="mt-20 flex place-content-between ">
          <div className="font-semibold text-2xl">Barang Baru Nih!</div>
          <div className="inline-flex gap-1 font-medium">
            Lihat Semua
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {barang.length === 0 ? (
            <div className="col-span-4 text-center text-gray-600 text-lg font-medium py-10">
              Belum ada barang baru, nantikan terus updatenya ya 🕒
            </div>
          ) : (
            barang.map((item) => (
              <div key={item.id_barang} className="">
                <div className="bg-gray-300 rounded-4xl h-[300px]">
                  <img
                    src={
                      item.gambar_barang?.length > 0
                        ? item.gambar_barang[0].src_img
                        : "/images/default-image.jpg"
                    }
                    alt={item.nama_barang}
                    className="object-cover w-full h-full rounded-t-4xl"
                  />
                </div>

                <div className="text-lg font-semibold mt-2">
                  {item.nama_barang}
                </div>
                <div className="text-md font-medium">
                  {formatPrice(item.harga_barang)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-20 font-semibold text-2xl">Jelajahi Kategori</div>
        <div className="grid grid-cols-4 grid-rows-3 gap-4">
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Interior-2.png"
              alt="Interior"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4">
              Interior & Utensil
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Elektronik-1.png"
              alt="Elektronik"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4">
              Elektronik & Gadget
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Buku-1.png"
              alt="Buku"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4 text-white">
              Buku, Alat Tulis, & Peralatan Sekolah
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Hobi-1.png"
              alt="Hobi"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4 text-white">
              Hobi, Mainan, & Koleksi
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Pakaian-1.png"
              alt="Pakaian"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4 text-white">
              Pakaian & Aksesoris
            </div>
          </div>

          <div className="col-span-2">
            <img
              src="/images/Home/Kategori/Group-79.png"
              alt="Pakaian"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Outdoor-1.png"
              alt="Outdoor"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4 text-white">
              Perlengkapan Taman & Outdoor
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Otomotif-1.png"
              alt="Otomotif"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4 text-white">
              Otomotif
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Bayi-1.png"
              alt="Bayi"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4 text-white">
              Perlengkapan Bayi & Anak
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Kantor-3.png"
              alt="Kantor"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4">
              Peralatan Kantor & Industri
            </div>
          </div>
          <div className="relative bg-gray-500 rounded-4xl overflow-clip">
            <img
              src="/images/Home/Kategori/Categories-Kosmetik-1.png"
              alt="Kosmetik"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 font-semibold text-xl p-4">
              Kosmetik & Perawatan Diri
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-20">
          <div className="text-center rounded-4xl p-8 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] grid grid-cols-3">
            <div className="text-white text-left col-span-2">
              <h3 className="font-[Montage-Demo] text-4xl">
                LOYALTY REWARDS BUAT KAMU YANG SETIA
              </h3>
              <p className="">
                Kumpulkan poin dari setiap pembelian dan tukarkan jadi diskon
                atau hadiah spesial!
              </p>
              <button className="bg-white text-[#220593] font-semibold px-6 py-3 rounded-4xl mt-4">
                Pelajari Lebih Lanjut
              </button>
            </div>
            {/* <img src="" alt="Gambar 1" /> */}
          </div>
          <div className="text-center rounded-4xl p-8 bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] grid grid-cols-3">
            <div className="text-white text-left col-span-2">
              <h3 className="font-[Montage-Demo] text-4xl">
                GABUNG JADI PENITIP SEKARANG!
              </h3>
              <p className="">
                Jual barang bekasmu di platform kami. Gak ribet, tinggal titip,
                kami bantu jualin!
              </p>
              <button className="bg-white text-[#220593] font-semibold px-6 py-3 rounded-4xl mt-4">
                Daftar Jadi Penitip
              </button>
            </div>
            {/* <img src="" alt="Gambar 1" /> */}
          </div>
        </div>

        <div className="text-center text-7xl font-medium bg-[#EDF6FF] rounded-4xl p-30 mt-20">
          Download apk sekarang!
        </div>
      </div>
      <Footer />
    </div>
  );
}
