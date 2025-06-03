import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, context) {
    const { id_penitipan } = context.params;


    try {
        const [rows] = await pool.query(
            `
            SELECT
                pb.id_penitipan,
                pb.no_nota,
                pb.tanggal_masuk,
                DATE_ADD(pb.tanggal_masuk, INTERVAL 30 DAY) AS tanggal_expire,
                pt.id_penitip,
                pt.nama AS nama_penitip,
                b.id_barang,
                b.nama_barang,
                b.harga_barang,
                b.berat_barang,
                b.tanggal_garansi,
                qc.id_pegawai AS id_qc,
                qc.nama AS nama_qc
            FROM penitipanbarang pb
            JOIN penitip pt ON pb.id_penitip = pt.id_penitip
            JOIN barang b ON pb.id_penitipan = b.id_penitipan
            JOIN pegawai qc ON b.id_petugas_qc = qc.id_pegawai
            WHERE pb.id_penitipan = ?
            `,
            [id_penitipan]
        );


        if (rows.length === 0) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        // Ambil data penitipan utama dari baris pertama
        const first = rows[0];
        const response = {
            id_penitipan: first.id_penitipan,
            no_nota: first.no_nota,
            tanggal_masuk: first.tanggal_masuk,
            tanggal_expire: first.tanggal_expire,
            penitip: {
                id: first.id_penitip,
                nama: first.nama_penitip,
                alamat: first.alamat_penitip,
            },
            qc: {
                id: first.id_qc,
                nama: first.nama_qc,
            },
            barang: rows.map((row) => ({
                id_barang: row.id_barang,
                nama_barang: row.nama_barang,
                harga_barang: row.harga_barang,
                berat_barang: row.berat_barang,
                tanggal_garansi: row.tanggal_garansi,
            })),
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("GET /api/transaksi-penitipan/nota/[id_penitipan] error:", error);
        return NextResponse.json({ error: "Gagal mengambil data nota." }, { status: 500 });
    }
}
