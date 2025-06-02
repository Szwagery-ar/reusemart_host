import pool from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT p.id_pengiriman, t.no_nota, p.jenis_pengiriman, p.tanggal_kirim, p.status_pengiriman, 
                   peg.nama AS kurir_name, a.lokasi AS alamat_lokasi
            FROM pengiriman p
            JOIN transaksi t ON p.id_transaksi = t.id_transaksi
            LEFT JOIN pegawai peg ON p.id_petugas_kurir = peg.id_pegawai
            LEFT JOIN alamat a ON p.id_alamat = a.id_alamat
        `;
        let values = [];

        if (search) {
            query += ` WHERE t.no_nota LIKE ? OR peg.nama LIKE ? OR a.lokasi LIKE ?`;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [pengiriman] = await pool.query(query, values);

        return NextResponse.json({ pengiriman }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Pengiriman" }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        const { id_transaksi, id_petugas_kurir, id_alamat, jenis_pengiriman } = await request.json();

        if (!id_transaksi || !jenis_pengiriman || !id_alamat) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Ambil data transaksi
        const [transaksiResult] = await pool.query(
            "SELECT harga_awal, diskon, ongkos_kirim, tanggal_lunas FROM transaksi WHERE id_transaksi = ?",
            [id_transaksi]
        );

        if (!transaksiResult || transaksiResult.length === 0) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan!" }, { status: 404 });
        }

        const transaksi = transaksiResult[0];

        // Hitung ongkos kirim
        let ongkos_kirim = 0;
        if (jenis_pengiriman === 'COURIER') {
            ongkos_kirim = transaksi.harga_awal < 1500000 ? 100000 : 0;
        }

        const harga_awal = parseFloat(transaksi.harga_awal);
        const diskon = parseFloat(transaksi.diskon);
        const harga_akhir = (harga_awal + ongkos_kirim - diskon).toFixed(2);

        // id_petugas_kurir null jika SELF_PICKUP
        const petugasKurir = jenis_pengiriman === "SELF_PICKUP" ? null : id_petugas_kurir;

        // Status pengiriman awal
        let status_pengiriman = "IN_PROGRESS";
        if (transaksi.tanggal_lunas) {
            status_pengiriman = jenis_pengiriman === "SELF_PICKUP" ? "PICKED_UP" : "IN_DELIVERY";
        }

        // Ambil lokasi dari alamat
        const [alamatResult] = await pool.query("SELECT lokasi FROM alamat WHERE id_alamat = ?", [id_alamat]);
        const lokasi = alamatResult[0]?.lokasi;

        if (!lokasi) {
            return NextResponse.json({ error: "Alamat tidak ditemukan!" }, { status: 404 });
        }

        // Simpan pengiriman ke DB dengan lokasi
        await pool.query(
            `INSERT INTO pengiriman 
             (id_transaksi, id_petugas_kurir, id_alamat, jenis_pengiriman, status_pengiriman, lokasi) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id_transaksi, petugasKurir, id_alamat, jenis_pengiriman, status_pengiriman, lokasi]
        );

        // Update ongkos_kirim dan harga_akhir di transaksi
        await pool.query(
            `UPDATE transaksi 
             SET ongkos_kirim = ?, harga_akhir = ? 
             WHERE id_transaksi = ?`,
            [ongkos_kirim, harga_akhir, id_transaksi]
        );

        // Ambil nama pegawai jika ada
        let namaPegawai = null;
        if (petugasKurir) {
            const [pegawai] = await pool.query(
                "SELECT nama FROM pegawai WHERE id_pegawai = ?",
                [petugasKurir]
            );
            namaPegawai = pegawai[0]?.nama;
        }

        return NextResponse.json({
            message: "Pengiriman created successfully!",
            lokasi,
            pegawai_name: namaPegawai || "No Kurir Assigned",
            ongkos_kirim,
            harga_akhir
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create Pengiriman" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_pengiriman, status_pengiriman, id_petugas_kurir } = await request.json();

        if (!id_pengiriman || !status_pengiriman) {
            return NextResponse.json({ error: "Required fields are missing!" }, { status: 400 });
        }

        const [pengirimanRows] = await pool.query(
            "SELECT * FROM pengiriman WHERE id_pengiriman = ?",
            [id_pengiriman]
        );

        if (pengirimanRows.length === 0) {
            return NextResponse.json({ error: "Pengiriman not found!" }, { status: 404 });
        }

        const pengiriman = pengirimanRows[0];
        const now = new Date().toISOString();
        const { id_transaksi } = pengiriman;

        // Validasi jenis_pengiriman = COURIER wajib punya id_petugas_kurir
        if (pengiriman.jenis_pengiriman === "COURIER") {
            if (!id_petugas_kurir) {
                return NextResponse.json({ error: "id_petugas_kurir is required for COURIER delivery!" }, { status: 400 });
            }

            // Tambahan: Cek apakah kurir sedang handle pengiriman lain
            if (["IN_DELIVERY", "PICKED_UP"].includes(status_pengiriman)) {
                const [ongoingDeliveries] = await pool.query(
                    `SELECT * FROM pengiriman 
                     WHERE id_petugas_kurir = ? 
                     AND status_pengiriman IN ('IN_DELIVERY', 'PICKED_UP')
                     AND id_pengiriman != ?`,
                    [id_petugas_kurir, id_pengiriman]
                );

                if (ongoingDeliveries.length > 0) {
                    return NextResponse.json({
                        error: "Kurir sedang menangani pengiriman lain yang sedang berlangsung!"
                    }, { status: 400 });
                }
            }
        }

        let updateQuery = `UPDATE pengiriman SET status_pengiriman = ?`;
        const queryParams = [status_pengiriman];

        // Set id_petugas_kurir
        if (pengiriman.jenis_pengiriman === "COURIER") {
            updateQuery += `, id_petugas_kurir = ?`;
            queryParams.push(id_petugas_kurir);
        } else if (pengiriman.jenis_pengiriman === "SELF_PICKUP") {
            updateQuery += `, id_petugas_kurir = NULL`;
        }

        // IN_DELIVERY or PICKED_UP
        if (["IN_DELIVERY", "PICKED_UP"].includes(status_pengiriman)) {
            updateQuery += `, tanggal_kirim = ?`;
            queryParams.push(now);

            await pool.query(
                `UPDATE transaksi SET status_transaksi = 'ON_PROGRESS' WHERE id_transaksi = ?`,
                [id_transaksi]
            );
        }

        // DONE
        if (status_pengiriman === "DONE") {
            updateQuery += `, tanggal_terima = ?`;
            queryParams.push(now);

            // Update transaksi DONE
            await pool.query(
                `UPDATE transaksi SET status_transaksi = 'DONE' WHERE id_transaksi = ?`,
                [id_transaksi]
            );

            // Update barang jadi SOLD
            await pool.query(`
                UPDATE barang 
                SET status_titip = 'SOLD', tanggal_keluar = ?
                WHERE id_barang IN (
                    SELECT id_barang FROM bridgebarangcart 
                    WHERE id_cart IN (
                        SELECT id_cart FROM cart 
                        WHERE id_transaksi = ?
                    )
                )
            `, [now, id_transaksi]);

            // Distribusikan komisi dari table komisi
            const [komisiList] = await pool.query(
                `SELECT id_penitip, id_petugas_hunter, komisi_penitip, komisi_hunter 
                 FROM komisi 
                 WHERE id_transaksi = ?`,
                [id_transaksi]
            );

            for (const komisi of komisiList) {
                // Ke penitip
                await pool.query(
                    `UPDATE penitip SET komisi = komisi + ? WHERE id_penitip = ?`,
                    [komisi.komisi_penitip, komisi.id_penitip]
                );

                // Ke hunter jika ada
                if (komisi.id_petugas_hunter) {
                    await pool.query(
                        `UPDATE pegawai SET komisi = komisi + ? WHERE id_pegawai = ?`,
                        [komisi.komisi_hunter, komisi.id_petugas_hunter]
                    );
                }
            }
        }

        updateQuery += ` WHERE id_pengiriman = ?`;
        queryParams.push(id_pengiriman);

        await pool.query(updateQuery, queryParams);

        return NextResponse.json({ message: "Pengiriman updated successfully!" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update Pengiriman" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_pengiriman } = await request.json();

        if (!id_pengiriman) {
            return NextResponse.json({ error: "id_pengiriman is required!" }, { status: 400 });
        }

        const [pengirimanExists] = await pool.query("SELECT * FROM pengiriman WHERE id_pengiriman = ?", [id_pengiriman]);

        if (pengirimanExists.length === 0) {
            return NextResponse.json({ error: "Pengiriman not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM pengiriman WHERE id_pengiriman = ?", [id_pengiriman]);

        return NextResponse.json({ message: "Pengiriman deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Pengiriman" }, { status: 500 });
    }
}
