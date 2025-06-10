import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { writeFile } from "fs/promises";

export async function GET(request) {
  try {
    await pool.query("SET SESSION group_concat_max_len = 10000");

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase() || "";

    const [rows] = await pool.query(
      `
      SELECT 
          b.id_penitipan,
          MIN(b.tanggal_masuk) AS tanggal_masuk,
          p.nama AS penitip_name,
          GROUP_CONCAT(
              JSON_OBJECT(
                  'id_barang', b.id_barang,
                  'nama_barang', b.nama_barang,
                  'kode_produk', b.kode_produk,
                  'harga_barang', b.harga_barang,
                  'status_titip', b.status_titip,
                  'tanggal_garansi', b.tanggal_garansi,
                  'tanggal_keluar', b.tanggal_keluar,
                  'gambar_barang', IFNULL((
                      SELECT GROUP_CONCAT(
                          JSON_OBJECT('id_gambar', g.id_gambar, 'src_img', g.src_img)
                          SEPARATOR ','
                      )
                      FROM gambarbarang g
                      WHERE g.id_barang = b.id_barang
                  ), '')
              )
          ) AS barang_json
      FROM barang b
      LEFT JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
      WHERE 
          LOWER(b.nama_barang) LIKE ? OR 
          LOWER(b.kode_produk) LIKE ? OR 
          LOWER(b.status_titip) LIKE ? OR
          LOWER(IFNULL(b.tanggal_garansi, '')) LIKE ? OR
          LOWER(IFNULL(b.tanggal_keluar, '')) LIKE ? OR
          LOWER(IFNULL(p.nama, '')) LIKE ? OR
          LOWER(DATE_FORMAT(b.tanggal_masuk, '%Y-%m-%d')) LIKE ? OR
          CAST(b.harga_barang AS CHAR) LIKE ?
      GROUP BY b.id_penitipan
      ORDER BY tanggal_masuk DESC
      `,
      [
        `%${q}%`,
        `%${q}%`,
        `%${q}%`,
        `%${q}%`,
        `%${q}%`,
        `%${q}%`,
        `%${q}%`,
        `%${q}%`,
      ]
    );

    const parsed = rows.map((row) => ({
      ...row,
      barang: JSON.parse(`[${row.barang_json}]`.replace(/}\s*{/g, "},{")).map(
        (b) => ({
          ...b,
          gambar_barang: b.gambar_barang
            ? JSON.parse(`[${b.gambar_barang}]`.replace(/}\s*{/g, "},{"))
            : [],
        })
      ),
    }));

    return NextResponse.json({ barang: parsed }, { status: 200 });
  } catch (error) {
    console.error("GET /api/transaksi-penitipan error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data barang penitipan." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const itemsRaw = formData.get("items");
    const items = JSON.parse(itemsRaw);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 barang harus diisi." },
        { status: 400 }
      );
    }

    const id_penitip = items[0].id_penitip;
    const tanggal_masuk = new Date();

    const [insertPenitipan] = await pool.query(
      `INSERT INTO penitipanbarang (id_penitip, tanggal_masuk) VALUES (?, ?)`,
      [id_penitip, tanggal_masuk]
    );
    const id_penitipan = insertPenitipan.insertId;

    const year = tanggal_masuk.getFullYear();
    const month = String(tanggal_masuk.getMonth() + 1).padStart(2, "0");
    const noNota = `${year}.${month}.${id_penitipan}`;

    await pool.query(
      `UPDATE penitipanbarang SET no_nota = ? WHERE id_penitipan = ?`,
      [noNota, id_penitipan]
    );

    const [lastBarang] = await pool.query(
      "SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1"
    );
    let nextId = lastBarang.length > 0 ? lastBarang[0].id_barang + 1 : 1;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const {
        id_penitip,
        nama_barang,
        deskripsi_barang,
        berat_barang,
        harga_barang,
        tanggal_garansi,
        kategori_ids,
        id_petugas_qc,
      } = item;

      if (
        !id_penitip ||
        !nama_barang ||
        !deskripsi_barang ||
        !berat_barang ||
        !harga_barang ||
        !kategori_ids ||
        !id_petugas_qc
      ) {
        return NextResponse.json(
          { error: `Semua field wajib diisi untuk barang ke-${i + 1}` },
          { status: 400 }
        );
      }

      // if (kategori_ids.includes(1) && !tanggal_garansi) {
      //     return NextResponse.json({ error: `Tanggal garansi wajib diisi untuk kategori Elektronik (barang ke-${i + 1})` }, { status: 400 });
      // }

      const kode_produk = `${nama_barang.charAt(0).toUpperCase()}${nextId}`;
      const status_titip = "AVAILABLE";
      //const tanggal_masuk = new Date();
      const tanggal_expire = new Date(tanggal_masuk);
      tanggal_expire.setDate(tanggal_expire.getDate() + 30);

      const [insertResult] = await pool.query(
        `INSERT INTO barang (
            id_penitipan, kode_produk, nama_barang, deskripsi_barang,
            berat_barang, harga_barang, tanggal_garansi, tanggal_masuk, tanggal_expire, status_titip, id_petugas_qc
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_penitipan,
          kode_produk,
          nama_barang,
          deskripsi_barang,
          berat_barang,
          harga_barang,
          tanggal_garansi || null,
          tanggal_masuk,
          tanggal_expire,
          status_titip,
          id_petugas_qc,
        ]
      );

      const id_barang = insertResult.insertId;

      // 🔁 Tambahkan kategori (opsional)
      for (const id_kategori of kategori_ids) {
        await pool.query(
          `INSERT INTO bridgekategoribarang (id_barang, id_kategori) VALUES (?, ?)`,
          [id_barang, id_kategori]
        );
      }

      // 🔁 Tangani banyak file: gambar_barang_0, gambar_barang_1, ...
      const gambarKey = `gambar_barang_${i}`;
      const gambarFiles = formData
        .getAll(gambarKey)
        .filter((f) => f instanceof File);

      if (gambarFiles.length === 0) {
        return NextResponse.json(
          { error: `Barang ke-${i + 1} harus punya minimal 1 gambar.` },
          { status: 400 }
        );
      }

      for (const file of gambarFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name}`;
        const filePath = path.join(process.cwd(), "public/uploads", filename);

        await writeFile(filePath, buffer);

        await pool.query(
          `INSERT INTO gambarbarang (id_barang, src_img) VALUES (?, ?)`,
          [id_barang, `/uploads/${filename}`]
        );
      }

      nextId++;
    }

    return NextResponse.json(
      { message: "Semua barang berhasil ditambahkan!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/transaksi-penitipan error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan barang titipan." },
      { status: 500 }
    );
  }
}