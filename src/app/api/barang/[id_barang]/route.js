import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";


export async function GET(_, { params }) {
    const { id_barang } = await params;

    try {
        const query = `
            SELECT 
                b.id_barang, b.kode_produk, b.nama_barang, b.deskripsi_barang,
                b.harga_barang, b.status_titip, b.tanggal_masuk, b.tanggal_keluar,
                b.tanggal_garansi, b.berat_barang, p.id_penitip, p.nama AS penitip_name,
                gb.id_gambar, gb.src_img,
                k.nama_kategori
            FROM barang b
            LEFT JOIN penitip p ON b.id_penitip = p.id_penitip
            LEFT JOIN gambarbarang gb ON b.id_barang = gb.id_barang
            LEFT JOIN bridgekategoribarang bk ON b.id_barang = bk.id_barang
            LEFT JOIN kategoribarang k ON bk.id_kategori = k.id_kategori
            WHERE b.id_barang = ?
        `;

        const [barang] = await pool.query(query, [id_barang]);

        if (barang.length === 0) {
            return NextResponse.json({ error: "Barang tidak ditemukan" }, { status: 404 });
        }

        const grouped = barang.reduce((acc, item) => {
            if (!acc) {
                acc = {
                    ...item,
                    gambar_barang: [],
                    kategori_barang: [],
                };
            }
            if (item.id_gambar) {
                acc.gambar_barang.push({
                    id_gambar: item.id_gambar,
                    src_img: item.src_img,
                });
            }

            if (item.nama_kategori && !acc.kategori_barang.includes(item.nama_kategori)) {
                acc.kategori_barang.push(item.nama_kategori);
            }

            return acc;
        }, null);

        return NextResponse.json({ barang: grouped }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ✅ Ini benar — gunakan parameter kedua
export async function PUT(request, { params }) {
    const { id_barang } = params;

    try {
        const formData = await request.formData();

        const nama_barang = formData.get("nama_barang");
        const deskripsi_barang = formData.get("deskripsi_barang");
        const harga_barang = formData.get("harga_barang");
        const berat_barang = formData.get("berat_barang");
        const tanggal_garansi = formData.get("tanggal_garansi");
        const status_titip = formData.get("status_titip") || "AVAILABLE";

        // Validasi field
        if (!nama_barang || !deskripsi_barang || !harga_barang || !berat_barang || !tanggal_garansi || !status_titip) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        // Update data barang
        await pool.query(
            `UPDATE barang 
       SET nama_barang = ?, deskripsi_barang = ?, harga_barang = ?, berat_barang = ?, tanggal_garansi = ?, status_titip = ?
       WHERE id_barang = ?`,
            [nama_barang, deskripsi_barang, harga_barang, berat_barang, tanggal_garansi, status_titip, id_barang]
        );

        // Simpan gambar baru (jika ada)
        const files = formData.getAll("gambar");
        if (files.length > 0 && files[0]?.name) {
            // Hapus gambar lama dari DB (opsional, jika tidak ingin menumpuk)
            await pool.query(`DELETE FROM gambarbarang WHERE id_barang = ?`, [id_barang]);


            for (const file of files) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${uuidv4()}-${file.name}`;
                const filePath = path.join(process.cwd(), "public", "uploads", fileName);

                fs.writeFileSync(filePath, buffer);

                // Simpan path ke DB
                await pool.query(
                    `INSERT INTO gambarbarang (id_barang, src_img) VALUES (?, ?)`,
                    [id_barang, `/uploads/${fileName}`]
                );
            }
        }

        return NextResponse.json({ message: "Barang & gambar berhasil diupdate!" }, { status: 200 });
    } catch (err) {
        console.error("Error updating barang:", err);
        return NextResponse.json({ error: "Gagal mengupdate barang" }, { status: 500 });
    }
}

