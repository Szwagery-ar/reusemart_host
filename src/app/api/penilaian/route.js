import pool from "@/lib/db";
import { NextResponse } from "next/server";

// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const search = searchParams.get("q");

//         let query = `
//             SELECT 
//                 b.id_barang, 
//                 b.kode_produk, 
//                 b.nama_barang, 
//                 b.deskripsi_barang, 
//                 b.harga_barang, 
//                 b.status_titip, 
//                 b.tanggal_masuk, 
//                 b.tanggal_keluar, 
//                 b.tanggal_garansi, 
//                 p.nama AS nama_penitip,
//                 gb.id_gambar, 
//                 gb.src_img,
//                 kb.nama_kategori
//             FROM barang b
//             LEFT JOIN penitipanbarang pb ON pb.id_penitipan = b.id_penitipan
//             LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
//             LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
//             LEFT JOIN bridgekategoribarang bkb ON b.id_barang = bkb.id_barang
//             LEFT JOIN kategoribarang kb ON bkb.id_kategori = kb.id_kategori
//             WHERE b.status_titip IN ('AVAILABLE', 'EXTENDED')
//         `;

//         let values = [];

//         if (search) {
//             query += ` AND (b.nama_barang LIKE ? OR kb.nama_kategori LIKE ?)`;
//             values.push(`%${search}%`, `%${search}%`);
//         }

//         const [barang] = await pool.query(query, values);

//         const groupedBarang = barang.reduce((acc, item) => {
//             if (!acc[item.id_barang]) {
//                 acc[item.id_barang] = {
//                     ...item,
//                     gambar_barang: [],
//                     kategori_barang: [],
//                 };
//             }
//             if (item.id_gambar) {
//                 acc[item.id_barang].gambar_barang.push({
//                     id_gambar: item.id_gambar,
//                     src_img: item.src_img,
//                 });
//             }
//             if (item.nama_kategori) {
//                 acc[item.id_barang].kategori_barang.push(item.nama_kategori);
//             }
//             return acc;
//         }, {});

//         const result = Object.values(groupedBarang);

//         return NextResponse.json({ barang: result }, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching barang:", error);
//         return NextResponse.json(
//             { error: "Failed to fetch Barang" },
//             { status: 500 }
//         );
//     }
// }

export async function GET() {
  try {
    const query = `
      SELECT 
        b.id_barang,  
        b.nama_barang, 
        b.tanggal_masuk, 
        p.nama AS nama_penitip,
        b.status_titip, 
        b.harga_barang
      FROM barang b
      LEFT JOIN penitipanbarang pb ON pb.id_penitipan = b.id_penitipan
      LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
      WHERE p.nama = 'Adi Nugroho'
        AND b.tanggal_masuk >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
      ORDER BY b.tanggal_masuk DESC;
    `;

    const [rows] = await pool.query(query);
    return NextResponse.json({ barang: rows }, { status: 200 });

  } catch (error) {
    console.error("Error fetching barang:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data barang" },
      { status: 500 }
    );
  }
}


// const search = searchParams.get("q");
// if (search) {
//   query += ` AND (b.nama_barang LIKE ? OR kb.nama_kategori LIKE ?)`;
//   values.push(`%${search}%`, `%${search}%`);
// }


// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const search = searchParams.get("q");

//         let query = `
//             SELECT
//                 b.id_barang,
//                 b.kode_produk,
//                 b.nama_barang,
//                 b.deskripsi_barang,
//                 b.harga_barang,
//                 b.status_titip,
//                 b.tanggal_masuk,
//                 b.tanggal_keluar,
//                 b.tanggal_garansi,
//                 p.nama AS nama_penitip,
//                 gb.id_gambar,
//                 gb.src_img,
//                 kb.nama_kategori
//             FROM barang b
//             LEFT JOIN penitipanbarang pb ON pb.id_penitipan = b.id_penitipan
//             LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
//             LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
//             LEFT JOIN bridgekategoribarang bkb ON b.id_barang = bkb.id_barang
//             LEFT JOIN kategoribarang kb ON bkb.id_kategori = kb.id_kategori
//             WHERE b.status_titip IN ('AVAILABLE', 'EXTENDED')
//               AND p.id_penitip = ?
//               AND b.tanggal_masuk >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
//         `;

//         let values = ['T1'];

//         if (search) {
//             query += ` AND (b.nama_barang LIKE ? OR kb.nama_kategori LIKE ?)`;
//             values.push(`%${search}%`, `%${search}%`);
//         }

//         const [barang] = await pool.query(query, values);

//         const groupedBarang = barang.reduce((acc, item) => {
//             if (!acc[item.id_barang]) {
//                 acc[item.id_barang] = {
//                     ...item,
//                     gambar_barang: [],
//                     kategori_barang: [],
//                 };
//             }
//             if (item.id_gambar) {
//                 acc[item.id_barang].gambar_barang.push({
//                     id_gambar: item.id_gambar,
//                     src_img: item.src_img,
//                 });
//             }
//             if (item.nama_kategori) {
//                 acc[item.id_barang].kategori_barang.push(item.nama_kategori);
//             }
//             return acc;
//         }, {});

//         const result = Object.values(groupedBarang);

//         return NextResponse.json({ barang: result }, { status: 200 });
//     } catch (error) {
//         console.error("Error fetching barang:", error);
//         return NextResponse.json(
//             { error: "Failed to fetch Barang" },
//             { status: 500 }
//         );
//     }
// }