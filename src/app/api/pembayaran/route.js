import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT p.id_pembayaran, p.status_pembayaran, p.img_bukti_transfer, t.no_nota, peg.nama AS petugas_name
            FROM pembayaran p
            JOIN transaksi t ON p.id_transaksi = t.id_transaksi
            LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
        `;
        let values = [];

        if (search) {
            query += ` WHERE t.no_nota LIKE ? OR peg.nama LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        }

        const [pembayaran] = await pool.query(query, values);

        return NextResponse.json({ pembayaran }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Pembayaran" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { id_transaksi, img_bukti_transfer } = await request.json();

        if (!id_transaksi || !img_bukti_transfer) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Set status_pembayaran ke PENDING dan tanggal_lunas ke null
        const status_pembayaran = "PENDING";
        const tanggal_lunas = null;

        // Insert pembayaran dengan status PENDING
        await pool.query(
            "INSERT INTO pembayaran (id_transaksi, status_pembayaran, img_bukti_transfer) VALUES (?, ?, ?)",
            [id_transaksi, status_pembayaran, img_bukti_transfer]
        );

        // Tidak perlu update transaksi untuk tanggal_lunas karena status masih PENDING

        return NextResponse.json({ message: "Pembayaran created successfully, status PENDING!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to create Pembayaran" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_pembayaran, id_petugas_cs, status_pembayaran } = await request.json();

        if (!id_pembayaran || !id_petugas_cs || !status_pembayaran) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [paymentExists] = await pool.query(
            "SELECT id_transaksi FROM pembayaran WHERE id_pembayaran = ?",
            [id_pembayaran]
        );

        if (!paymentExists || paymentExists.length === 0) {
            return NextResponse.json({ error: "Payment ID not found!" }, { status: 404 });
        }

        const id_transaksi = paymentExists[0].id_transaksi;

        let tanggal_lunas = null;

        if (status_pembayaran === "CONFIRMED") {
            tanggal_lunas = new Date().toISOString();

            // Ambil data harga_awal, diskon, dan id_pembeli dari transaksi
            const [transaksiResult] = await pool.query(
                `SELECT harga_awal, diskon, id_pembeli FROM transaksi WHERE id_transaksi = ?`,
                [id_transaksi]
            );

            if (!transaksiResult || transaksiResult.length === 0) {
                return NextResponse.json({ error: "Transaction not found!" }, { status: 404 });
            }

            const { harga_awal, diskon, id_pembeli } = transaksiResult[0];
            const total_belanja = harga_awal - diskon;

            // Hitung poin
            let poin = Math.floor(total_belanja / 10000);

            // Bonus 20% kalau belanja > 500k
            if (total_belanja > 500000) {
                poin += Math.floor(poin * 0.2);
            }

            // Update transaksi: tanggal_lunas, status_transaksi, tambahan_poin
            await pool.query(
                "UPDATE transaksi SET tanggal_lunas = ?, status_transaksi = 'PAID', tambahan_poin = ? WHERE id_transaksi = ?",
                [tanggal_lunas, poin, id_transaksi]
            );

            // Tambahkan ke poin_loyalitas pembeli
            await pool.query(
                "UPDATE pembeli SET poin_loyalitas = poin_loyalitas + ? WHERE id_pembeli = ?",
                [poin, id_pembeli]
            );
        }

        // Jika FAILED
        if (status_pembayaran === "FAILED") {
            await pool.query(
                "UPDATE transaksi SET status_transaksi = 'CANCELLED' WHERE id_transaksi = ?",
                [id_transaksi]
            );

            await pool.query(
                "UPDATE pengiriman SET status_pengiriman = 'FAILED' WHERE id_transaksi = ?",
                [id_transaksi]
            );

            await pool.query(`
                UPDATE barang 
                SET status_titip = 'AVAILABLE',
                id_transaksi = NULL
                WHERE id_barang IN (
                    SELECT id_barang FROM bridgebarangcart 
                    WHERE id_cart IN (
                        SELECT id_cart FROM cart WHERE id_transaksi = ?
                    )
                )
            `, [id_transaksi]);
        }

        // Update status_pembayaran dan petugas CS
        await pool.query(
            "UPDATE pembayaran SET status_pembayaran = ?, id_petugas_cs = ? WHERE id_pembayaran = ?",
            [status_pembayaran, id_petugas_cs, id_pembayaran]
        );

        return NextResponse.json({ message: "Pembayaran updated successfully!" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update Pembayaran" }, { status: 500 });
    }
}



export async function DELETE(request) {
    try {
        const { id_pembayaran } = await request.json();

        if (!id_pembayaran) {
            return NextResponse.json({ error: "id_pembayaran is required!" }, { status: 400 });
        }

        const [pembayaranExists] = await pool.query("SELECT * FROM pembayaran WHERE id_pembayaran = ?", [id_pembayaran]);

        if (pembayaranExists.length === 0) {
            return NextResponse.json({ error: "Pembayaran not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM pembayaran WHERE id_pembayaran = ?", [id_pembayaran]);

        return NextResponse.json({ message: "Pembayaran deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Pembayaran" }, { status: 500 });
    }
}
