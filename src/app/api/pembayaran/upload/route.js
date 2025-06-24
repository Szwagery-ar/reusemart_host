import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pool from "@/lib/db";
import { put } from "@vercel/blob";

export async function PUT(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const id_transaksi = formData.get("id_transaksi");

        if (!file || typeof file.name !== "string" || !id_transaksi) {
            return NextResponse.json({ error: "File atau ID Transaksi tidak valid" }, { status: 400 });
        }

        // const bytes = await file.arrayBuffer();
        // const buffer = Buffer.from(bytes);

        // const fileName = `bukti-${Date.now()}-${file.name}`;
        // const filePath = path.join(process.cwd(), "public", "uploads", fileName);
        // await fs.promises.writeFile(filePath, buffer);

        // const imgUrl = `/uploads/${fileName}`;

        // // Update ke tabel pembayaran
        // await pool.query(
        //     `UPDATE pembayaran SET img_bukti_transfer = ? WHERE id_transaksi = ?`,
        //     [imgUrl, id_transaksi]
        // );


        //pakai blob 
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `bukti-${Date.now()}-${file.name}`;

        // Upload ke Vercel Blob Storage
        const { url } = await put(fileName, buffer, {
            access: "public", // bisa diakses langsung
        });

        // Simpan URL ke database
        await pool.query(
            `UPDATE pembayaran SET img_bukti_transfer = ? WHERE id_transaksi = ?`,
            [url, id_transaksi]
        );

        return NextResponse.json(
            {
                message: "Bukti pembayaran berhasil diupload dan disimpan.",
                img_bukti_transfer: url,
            },
            { status: 200 }
        );

        return NextResponse.json({ message: "Bukti pembayaran berhasil diupload dan disimpan.", img_bukti_transfer: imgUrl }, { status: 200 });
    } catch (error) {
        console.error("Upload + update pembayaran error:", error);
        return NextResponse.json({ error: "Gagal upload dan simpan bukti pembayaran." }, { status: 500 });
    }
}