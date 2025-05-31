import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { id_pembeli, selectedItems, diskon: inputDiskon = 0, poin_digunakan = 0 } = await request.json();


        if (!id_pembeli || !Array.isArray(selectedItems) || selectedItems.length === 0) {
            return NextResponse.json(
                { error: "id_pembeli dan selectedItems wajib diisi!" },
                { status: 400 }
            );
        }

        const [barangCheckout] = await pool.query(
            `
            SELECT b.id_barang, b.harga_barang
            FROM bridgebarangcart bc
            JOIN barang b ON bc.id_barang = b.id_barang
            WHERE bc.id_bridge_barang IN (?)
            `,
            [selectedItems]
        );

        if (!barangCheckout || barangCheckout.length === 0) {
            return NextResponse.json(
                { error: "Barang yang dipilih tidak ditemukan!" },
                { status: 400 }
            );
        }

        const harga_awal = barangCheckout.reduce(
            (total, item) => total + parseFloat(item.harga_barang),
            0
        );

        const ongkos_kirim = 0;

        const [pembeli] = await pool.query(
            `SELECT poin_loyalitas FROM pembeli WHERE id_pembeli = ?`,
            [id_pembeli]
        );

        if (!pembeli || pembeli.length === 0) {
            return NextResponse.json(
                { error: "Pembeli tidak ditemukan!" },
                { status: 404 }
            );
        }

        if (poin_digunakan > 0) {
            await pool.query(
                `UPDATE pembeli SET poin_loyalitas = poin_loyalitas - ? WHERE id_pembeli = ?`,
                [poin_digunakan, id_pembeli]
            );
        }


        const poinTersedia = pembeli[0].poin_loyalitas;
        const maxDiskon = Math.floor(poinTersedia) * 10000;
        const diskon = Math.min(inputDiskon, maxDiskon, harga_awal);
        const harga_akhir = (harga_awal + ongkos_kirim - diskon).toFixed(2);

        let poinBaru = Math.floor(harga_akhir / 10000);

        const dapatBonus = harga_akhir > 500000;
        const bonusPoin = dapatBonus ? Math.floor(poinBaru * 0.2) : 0;

        const totalPoinTambahan = poinBaru + bonusPoin;


        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
        const [lastTransaksi] = await pool.query(
            "SELECT MAX(id_transaksi) AS last_id FROM transaksi"
        );
        const id_transaksi = (lastTransaksi[0].last_id || 0) + 1;
        const no_nota = `${year}.${month}.${id_transaksi}`;

        await pool.query(
            `
            INSERT INTO transaksi (
                id_transaksi, id_pembeli, status_transaksi, no_nota,
                harga_awal, ongkos_kirim, diskon, harga_akhir, tanggal_pesan, tanggal_lunas, tambahan_poin
            )
            VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, NOW(), NULL, ?)
            `,
            [
                id_transaksi,
                id_pembeli,
                no_nota,
                harga_awal,
                ongkos_kirim,
                diskon,
                harga_akhir,
                totalPoinTambahan
            ]
        );

        await pool.query(
            `
            UPDATE barang
            SET id_transaksi = ?, status_titip = 'HOLD'
            WHERE id_barang IN (?)
            `,
            [id_transaksi, barangCheckout.map((b) => b.id_barang)]
        );

        await pool.query(
            `UPDATE pembeli SET poin_loyalitas = poin_loyalitas + ? WHERE id_pembeli = ?`,
            [totalPoinTambahan, id_pembeli]
        );

        await pool.query(
            `
            UPDATE bridgebarangcart
            SET is_checkout = 1
            WHERE id_bridge_barang IN (?)
            `,
            [selectedItems]
        );

        return NextResponse.json(
            { message: "Transaksi berhasil dibuat!", id_transaksi },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/transaksi error:", error);
        return NextResponse.json(
            { error: error.message || "Gagal membuat transaksi." },
            { status: 500 }
        );
    }
}