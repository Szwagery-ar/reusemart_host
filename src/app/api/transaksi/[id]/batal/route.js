import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
    const id_transaksi = params.id;

    try {

        const [txRows] = await pool.query(
            `SELECT t.diskon, t.id_pembeli 
                FROM transaksi t 
                WHERE t.id_transaksi = ?`,
            [id_transaksi]
        );

        if (txRows.length === 0) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
        }

        const { diskon, id_pembeli } = txRows[0];

        // const [bridgeItems] = await pool.query(`
        //     SELECT bc.id_bridge_barang
        //     FROM barang b
        //     JOIN bridgebarangcart bc ON b.id_barang = bc.id_barang
        //     WHERE bc.id_transaksi = ?;
        // `, [id_transaksi]);

        // if (bridgeItems.length > 0) {
        //     const ids = bridgeItems.map(b => b.id_bridge_barang);
        //     await pool.query(`
        //         DELETE FROM bridgebarangcart
        //         WHERE id_bridge_barang IN (?)
        //     `, [ids]);
        // }


        //pakai db yang baru
        const [bridgeItems] = await pool.query(`
            SELECT bbt.id_bridge_barang_transaksi
            FROM bridgebarangtransaksi bbt
            WHERE bbt.ID_Transaksi = ?;
        `, [id_transaksi]);

        if (bridgeItems.length > 0) {
            const ids = bridgeItems.map(b => b.id_bridge_barang_transaksi);
            await pool.query(`
                DELETE FROM bridgebarangtransaksi
                WHERE id_bridge_barang_transaksi IN (?);
            `, [ids]);
        }


        await pool.query(`UPDATE transaksi SET status_transaksi = 'CANCELLED' WHERE id_transaksi = ?`, [id_transaksi]);

        await pool.query(`UPDATE pembayaran SET status_pembayaran = 'FAILED' WHERE id_transaksi = ?`, [id_transaksi]);

        await pool.query(`UPDATE pengiriman SET status_pengiriman = 'FAILED' WHERE id_transaksi = ?`, [id_transaksi]);

        await pool.query(`UPDATE barang SET status_titip = 'AVAILABLE' WHERE id_transaksi = ?`, [id_transaksi]);
        await pool.query(`UPDATE barang SET id_transaksi = NULL WHERE id_transaksi = ?`, [id_transaksi]);

        if (diskon && diskon > 0) {
            const poinDikembalikan = Math.floor(diskon / 10000);
            await pool.query(
                `UPDATE pembeli SET poin_loyalitas = poin_loyalitas + ? WHERE id_pembeli = ?`,
                [poinDikembalikan, id_pembeli]
            );
        }

        return NextResponse.json({ message: "Transaksi dibatalkan otomatis." }, { status: 200 });
    } catch (error) {
        console.error("Gagal batal otomatis:", error);
        return NextResponse.json({ error: "Gagal membatalkan transaksi." }, { status: 500 });
    }
}
