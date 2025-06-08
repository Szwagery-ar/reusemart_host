import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

///////// GET LAMA //////////
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
            SELECT 
                b.id_barang, 
                b.kode_produk, 
                b.nama_barang, 
                b.deskripsi_barang, 
                b.harga_barang, 
                b.status_titip, 
                b.tanggal_masuk, 
                b.tanggal_keluar, 
                b.tanggal_garansi, 
                p.nama AS nama_penitip,
                gb.id_gambar, 
                gb.src_img,
                kb.nama_kategori
            FROM barang b
            LEFT JOIN penitipanbarang pb ON pb.id_penitipan = b.id_penitipan
            LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
            LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
            LEFT JOIN bridgekategoribarang bkb ON b.id_barang = bkb.id_barang
            LEFT JOIN kategoribarang kb ON bkb.id_kategori = kb.id_kategori
            WHERE b.status_titip IN ('AVAILABLE', 'EXTENDED')
        `;

    let values = [];

    if (search) {
      query += ` AND (b.nama_barang LIKE ? OR kb.nama_kategori LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    const [barang] = await pool.query(query, values);

    const groupedBarang = barang.reduce((acc, item) => {
      if (!acc[item.id_barang]) {
        acc[item.id_barang] = {
          ...item,
          gambar_barang: [],
          kategori_barang: [],
        };
      }
      if (item.id_gambar) {
        acc[item.id_barang].gambar_barang.push({
          id_gambar: item.id_gambar,
          src_img: item.src_img,
        });
      }
      if (item.nama_kategori) {
        acc[item.id_barang].kategori_barang.push(item.nama_kategori);
      }
      return acc;
    }, {});

    const result = Object.values(groupedBarang);

    return NextResponse.json({ barang: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching barang:", error);
    return NextResponse.json(
      { error: "Failed to fetch Barang" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      id_penitip,
      nama_barang,
      deskripsi_barang,
      berat_barang,
      harga_barang,
      tanggal_garansi,
      status_titip,
      tanggal_masuk,
    } = await request.json();

    if (
      !id_penitip ||
      !nama_barang ||
      !deskripsi_barang ||
      !berat_barang ||
      !harga_barang ||
      !tanggal_garansi ||
      !status_titip ||
      !tanggal_masuk
    ) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    const firstLetter = nama_barang.charAt(0).toUpperCase();
    const [lastBarang] = await pool.query(
      "SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1"
    );
    const nextId = lastBarang.length > 0 ? lastBarang[0].id_barang + 1 : 1; // Increment the last ID
    const kode_produk = firstLetter + nextId;

    await pool.query(
      "INSERT INTO barang (id_penitip, kode_produk, nama_barang, deskripsi_barang, berat_barang, harga_barang, tanggal_garansi, status_titip, tanggal_masuk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id_penitip,
        kode_produk,
        nama_barang,
        deskripsi_barang,
        berat_barang,
        harga_barang,
        tanggal_garansi,
        status_titip,
        tanggal_masuk,
      ] // Urutan harus sesuai dengan kolom
    );

    return NextResponse.json(
      { message: "Barang added successfully!", nama_barang, kode_produk },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding barang:", error);
    return NextResponse.json(
      { error: "Failed to add Barang" },
      { status: 500 }
    );
  }
}

// export async function POST(request) {
//     try {
//         const formData = await request.formData();

//         const id_penitip = formData.get("id_penitip")?.toString();
//         const nama_barang = formData.get("nama_barang")?.toString();
//         const deskripsi_barang = formData.get("deskripsi_barang")?.toString();
//         const berat_barang = formData.get("berat_barang")?.toString();
//         const harga_barang = formData.get("harga_barang")?.toString();
//         const tanggal_garansi = formData.get("tanggal_garansi")?.toString();
//         const gambarFiles = formData.getAll("gambar").filter(f => f instanceof File);

//         if (
//             !id_penitip || !nama_barang || !deskripsi_barang || !berat_barang ||
//             !harga_barang || !tanggal_garansi || gambarFiles.length < 2
//         ) {
//             return NextResponse.json({ error: "Semua field & minimal 2 gambar wajib diisi!" }, { status: 400 });
//         }

//         const firstLetter = nama_barang.charAt(0).toUpperCase();
//         const [lastBarang] = await pool.query("SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1");
//         const nextId = lastBarang.length > 0 ? lastBarang[0].id_barang + 1 : 1;
//         const kode_produk = `${firstLetter}${nextId}`;
//         const tanggal_masuk = new Date();
//         const status_titip = "AVAILABLE";

//         const [insertResult] = await pool.query(
//             `INSERT INTO barang (
//                 id_penitip, kode_produk, nama_barang, deskripsi_barang,
//                 berat_barang, harga_barang, tanggal_garansi,
//                 status_titip, tanggal_masuk
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 id_penitip, kode_produk, nama_barang, deskripsi_barang,
//                 berat_barang, harga_barang, tanggal_garansi,
//                 status_titip, tanggal_masuk,
//             ]
//         );

//         const id_barang = insertResult.insertId;

//         // Simpan gambar ke file system dan path-nya ke DB
//         for (const file of gambarFiles) {
//             const buffer = Buffer.from(await file.arrayBuffer());
//             const filename = `${uuidv4()}-${file.name}`;
//             const filePath = path.join(process.cwd(), "public/uploads", filename);

//             await writeFile(filePath, buffer);

//             await pool.query(
//                 `INSERT INTO gambarbarang (id_barang, src_img) VALUES (?, ?)`,
//                 [id_barang, `/uploads/${filename}`] // simpan path ke kolom src_img
//             );
//         }

//         return NextResponse.json(
//             {
//                 message: "Barang & gambar berhasil ditambahkan",
//                 kode_produk,
//                 barangBaru: {
//                     id_barang,
//                     nama_barang,
//                     harga_barang,
//                     deskripsi_barang,
//                     berat_barang,
//                     tanggal_garansi,
//                     tanggal_masuk,
//                     status_titip,
//                     kode_produk,
//                     id_penitip,
//                     gambar_barang: [], // agar frontend tidak error
//                 },
//             },
//             { status: 201 }
//         );
//     } catch (err) {
//         console.error("Gagal tambah barang:", err);
//         return NextResponse.json({ error: "Gagal menambahkan barang" }, { status: 500 });
//     }
// }

export async function PUT(request) {
  try {
    const {
      id_barang,
      deskripsi_barang,
      berat_barang,
      harga_barang,
      tanggal_garansi,
      status_titip,
    } = await request.json();

    if (
      !id_barang ||
      !deskripsi_barang ||
      !berat_barang ||
      !harga_barang ||
      !tanggal_garansi ||
      !status_titip
    ) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE barang SET deskripsi_barang = ?, berat_barang = ?, harga_barang = ?, tanggal_garansi = ?, status_titip = ? WHERE id_barang = ?`,
      [
        deskripsi_barang,
        berat_barang,
        harga_barang,
        tanggal_garansi,
        status_titip,
        id_barang,
      ]
    );

    return NextResponse.json(
      { message: "Barang updated successfully!", id_barang },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating barang:", error);
    return NextResponse.json(
      { error: "Failed to update Barang" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_barang } = await request.json();

    if (!id_barang) {
      return NextResponse.json(
        { error: "id_barang is required!" },
        { status: 400 }
      );
    }

    const [barangExists] = await pool.query(
      "SELECT * FROM barang WHERE id_barang = ?",
      [id_barang]
    );

    if (barangExists.length === 0) {
      return NextResponse.json({ error: "Barang not found!" }, { status: 404 });
    }

    await pool.query("DELETE FROM barang WHERE id_barang = ?", [id_barang]);

    return NextResponse.json(
      { message: "Barang deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete Barang" },
      { status: 500 }
    );
  }
}
