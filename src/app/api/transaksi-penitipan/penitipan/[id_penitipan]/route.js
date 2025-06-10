import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, context) {
  const id_penitip = context.params?.id_penitip;

  if (!id_penitip) {
    return NextResponse.json(
      { error: "ID penitip tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    const [barangRows] = await pool.query(
      `
        SELECT 
            b.id_barang,
            b.nama_barang,
            b.kode_produk,
            b.harga_barang,
            b.status_titip,
            b.tanggal_garansi,
            b.tanggal_keluar,
            gb.id_gambar,
            gb.src_img,
            kb.nama_kategori
        FROM barang b
        LEFT JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
        LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
        LEFT JOIN gambarbarang gb ON gb.id_barang = b.id_barang
        LEFT JOIN bridgekategoribarang bkb ON b.id_barang = bkb.id_barang
        LEFT JOIN kategoribarang kb ON bkb.id_kategori = kb.id_kategori
        WHERE p.id_penitip = ?
    `,
      [id_penitip]
    );

    const barangMap = {};
    for (const row of barangRows) {
      if (!barangMap[row.id_barang]) {
        barangMap[row.id_barang] = {
          id_barang: row.id_barang,
          nama_barang: row.nama_barang,
          kode_produk: row.kode_produk,
          harga_barang: row.harga_barang,
          status_titip: row.status_titip,
          tanggal_garansi: row.tanggal_garansi,
          tanggal_keluar: row.tanggal_keluar,
          gambar_barang: [],
          kategori_barang: [],
        };
      }

      if (row.id_gambar) {
        barangMap[row.id_barang].gambar_barang.push({
          id_gambar: row.id_gambar,
          src_img: row.src_img,
        });
      }

      if (
        row.nama_kategori &&
        !barangMap[row.id_barang].kategori_barang.includes(row.nama_kategori)
      ) {
        barangMap[row.id_barang].kategori_barang.push(row.nama_kategori);
      }
    }

    return NextResponse.json(
      { barang: Object.values(barangMap) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching barang penitip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
