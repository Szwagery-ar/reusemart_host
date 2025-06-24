import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
    const id_transaksi = params.id;

    try {
        // 1. Ambil diskon dan ID pembeli dari transaksi
        const [txRows] = await pool.query(
            `SELECT diskon, id_pembeli FROM transaksi WHERE id_transaksi = ?`,
            [id_transaksi]
        );

        if (txRows.length === 0) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
        }

        const { diskon, id_pembeli } = txRows[0];

        // 2. Ambil id_barang dan id_bridge_barang_transaksi dari bridge
        const [bridgeItems] = await pool.query(`
            SELECT id_bridge_barang_transaksi, id_barang
            FROM bridgebarangtransaksi
            WHERE id_transaksi = ?;
        `, [id_transaksi]);

        const barangIds = bridgeItems.map(item => item.id_barang);
        const bridgeIds = bridgeItems.map(item => item.id_bridge_barang_transaksi);

        // 3. Hapus data bridge barang transaksi
        if (bridgeIds.length > 0) {
            await pool.query(`
                DELETE FROM bridgebarangtransaksi
                WHERE id_bridge_barang_transaksi IN (?);
            `, [bridgeIds]);
        }

        // 4. Update status_titip jadi AVAILABLE pada tabel barang
        if (barangIds.length > 0) {
            await pool.query(`
                UPDATE barang
                SET status_titip = 'AVAILABLE'
                WHERE id_barang IN (?);
            `, [barangIds]);
        }

        // 5. Update status transaksi, pembayaran, pengiriman
        await pool.query(`
            UPDATE transaksi
            SET status_transaksi = 'CANCELLED'
            WHERE id_transaksi = ?;
        `, [id_transaksi]);

        await pool.query(`
            UPDATE pembayaran
            SET status_pembayaran = 'FAILED'
            WHERE id_transaksi = ?;
        `, [id_transaksi]);

        await pool.query(`
            UPDATE pengiriman
            SET status_pengiriman = 'FAILED'
            WHERE id_transaksi = ?;
        `, [id_transaksi]);

        // 6. Kembalikan poin loyalitas jika ada diskon
        if (diskon && diskon > 0) {
            const poinDikembalikan = Math.floor(diskon / 10000);
            await pool.query(`
                UPDATE pembeli
                SET poin_loyalitas = poin_loyalitas + ?
                WHERE id_pembeli = ?;
            `, [poinDikembalikan, id_pembeli]);
        }

        // 7. Hapus barang dari keranjang jika masih ada
        if (barangIds.length > 0) {
            const [cartRows] = await pool.query(`
                SELECT id_cart FROM cart WHERE id_pembeli = ?;
            `, [id_pembeli]);

            const cartIds = cartRows.map(c => c.id_cart);
            if (cartIds.length > 0) {
                await pool.query(`
                DELETE FROM bridgebarangcart
                WHERE id_barang IN (?) AND id_cart IN (?);
                `, [barangIds, cartIds]);
            }
        }

        return NextResponse.json({ message: "Transaksi dibatalkan otomatis." }, { status: 200 });
    } catch (error) {
        console.error("Gagal batal otomatis:", error);
        return NextResponse.json({ error: "Gagal membatalkan transaksi." }, { status: 500 });
    }
}
