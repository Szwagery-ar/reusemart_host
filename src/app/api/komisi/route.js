import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT 
                k.id_komisi,
                t.no_nota,
                t.harga_awal - IFNULL(t.diskon, 0) AS harga_jual,
                k.komisi_reusemart,
                p.nama AS nama_penitip,
                k.komisi_penitip,
                h.nama AS nama_hunter,
                k.komisi_hunter
            FROM komisi k
            JOIN transaksi t ON k.id_transaksi = t.id_transaksi
            JOIN penitip p ON k.id_penitip = p.id_penitip
            LEFT JOIN pegawai h ON k.id_petugas_hunter = h.id_pegawai
        `;

        const values = [];

        if (search) {
            query += `
                WHERE 
                    t.no_nota LIKE ? 
                    OR p.nama LIKE ? 
                    OR h.nama LIKE ?
            `;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [komisi] = await pool.query(query, values);

        return NextResponse.json({ komisi }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch Komisi" }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        const { id_transaksi } = await request.json();

        if (!id_transaksi) {
            return NextResponse.json({ error: "id_transaksi is required!" }, { status: 400 });
        }

        // Cek status transaksi
        const [transaksiResult] = await pool.query(
            "SELECT status_transaksi FROM transaksi WHERE id_transaksi = ?",
            [id_transaksi]
        );

        if (!transaksiResult.length) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan!" }, { status: 404 });
        }

        const status_transaksi = transaksiResult[0].status_transaksi;

        if (!["PAID", "DONE"].includes(status_transaksi)) {
            return NextResponse.json({ error: "Komisi hanya bisa dihitung jika status transaksi sudah PAID atau DONE." }, { status: 400 });
        }

        // Ambil daftar barang dari bridgebarangtransaksi
        const [barangList] = await pool.query(`
            SELECT 
                b.id_barang,
                b.id_penitip,
                b.id_petugas_hunter,
                b.harga_barang,
                b.tanggal_masuk
            FROM bridgebarangtransaksi bt
            JOIN barang b ON bt.id_barang = b.id_barang
            WHERE bt.id_transaksi = ?
        `, [id_transaksi]);

        for (const barang of barangList) {
            const { id_barang, id_penitip, id_petugas_hunter, harga_barang, tanggal_masuk } = barang;

            const tanggal_masuk_date = new Date(tanggal_masuk);
            const now = new Date();
            const diffInDays = Math.floor((now - tanggal_masuk_date) / (1000 * 60 * 60 * 24));

            let persentase_reusemart = diffInDays >= 30 ? 0.30 : 0.20;
            let persentase_penitip = 1 - persentase_reusemart;
            let persentase_hunter = 0;

            let komisi_reusemart = harga_barang * persentase_reusemart;
            let komisi_penitip = harga_barang * persentase_penitip;

            // Bonus penitip jika laku dalam 7 hari
            if (diffInDays < 7) {
                const bonus = komisi_reusemart * 0.10;
                komisi_penitip += bonus;
                komisi_reusemart -= bonus;
            }

            if (id_petugas_hunter) {
                persentase_hunter = 0.01;
                const komisi_hunter = komisi_reusemart * persentase_hunter;
                komisi_reusemart -= komisi_hunter;

                await pool.query(`
                    INSERT INTO komisi (
                        id_transaksi, id_penitip, id_petugas_hunter,
                        komisi_penitip, komisi_reusemart, komisi_hunter
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    id_transaksi,
                    id_penitip,
                    id_petugas_hunter,
                    komisi_penitip,
                    komisi_reusemart,
                    komisi_hunter
                ]);
            } else {
                await pool.query(`
                    INSERT INTO komisi (
                        id_transaksi, id_penitip, komisi_penitip, komisi_reusemart
                    ) VALUES (?, ?, ?, ?)
                `, [
                    id_transaksi,
                    id_penitip,
                    komisi_penitip,
                    komisi_reusemart
                ]);
            }
        }

        return NextResponse.json({ message: "Komisi berhasil dihitung dan disimpan!" }, { status: 201 });

    } catch (error) {
        console.error("POST /api/komisi error:", error);
        return NextResponse.json({ error: "Gagal menghitung komisi." }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_komisi, id_transaksi, id_penitip, id_petugas_hunter, komisi_penitip, komisi_reusemart, komisi_hunter } = await request.json();

        if (!id_komisi || !id_transaksi || !id_penitip || !id_petugas_hunter || !komisi_penitip || !komisi_reusemart || !komisi_hunter) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [komisiExists] = await pool.query("SELECT * FROM komisi WHERE id_komisi = ?", [id_komisi]);

        if (komisiExists.length === 0) {
            return NextResponse.json({ error: "Komisi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE komisi SET id_transaksi = ?, id_penitip = ?, id_petugas_hunter = ?, komisi_penitip = ?, komisi_reusemart = ?, komisi_hunter = ? WHERE id_komisi = ?",
            [id_transaksi, id_penitip, id_petugas_hunter, komisi_penitip, komisi_reusemart, komisi_hunter, id_komisi]
        );

        return NextResponse.json({ message: "Komisi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Komisi" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_komisi } = await request.json();

        if (!id_komisi) {
            return NextResponse.json({ error: "id_komisi is required!" }, { status: 400 });
        }

        const [komisiExists] = await pool.query("SELECT * FROM komisi WHERE id_komisi = ?", [id_komisi]);

        if (komisiExists.length === 0) {
            return NextResponse.json({ error: "Komisi not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM komisi WHERE id_komisi = ?", [id_komisi]);

        return NextResponse.json({ message: "Komisi deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Komisi" }, { status: 500 });
    }
}
