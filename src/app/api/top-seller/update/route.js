import { NextResponse } from "next/server";
import pool from "@/lib/db";

// export async function POST() {
//     const connection = await pool.getConnection();

//     try {
//         await connection.beginTransaction();

//         // 1. Reset semua badge_level ke 'novice'
//         await connection.query(`UPDATE penitip SET badge_level = 'novice'`);

//         // 2. Hitung jumlah barang terjual bulanan (per penitip) dan update ke kolom
//         // await connection.query(`
//         //     UPDATE penitip p
//         //     JOIN (
//         //         SELECT pb.id_penitip, COUNT(b.id_barang) AS total_bulanan
//         //         FROM barang b
//         //         JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
//         //         WHERE b.status_titip = 'SOLD'
//         //           AND MONTH(b.tanggal_keluar) = MONTH(CURRENT_DATE())
//         //           AND YEAR(b.tanggal_keluar) = YEAR(CURRENT_DATE())
//         //         GROUP BY pb.id_penitip
//         //     ) t ON p.id_penitip = t.id_penitip
//         //     SET p.jml_barang_terjual_bulanan = t.total_bulanan
//         // `);

//         // 3. Update TOP SELLER berdasarkan yang paling tinggi
//         // await connection.query(`
//         //     UPDATE penitip
//         //     SET badge_level = 'TOP SELLER'
//         //     WHERE id_penitip = (
//         //         SELECT pb.id_penitip
//         //         FROM barang b
//         //         JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
//         //         WHERE b.status_titip = 'SOLD'
//         //           AND MONTH(b.tanggal_keluar) = MONTH(CURRENT_DATE())
//         //           AND YEAR(b.tanggal_keluar) = YEAR(CURRENT_DATE())
//         //         GROUP BY pb.id_penitip
//         //         ORDER BY COUNT(b.id_barang) DESC
//         //         LIMIT 1
//         //     )
//         // `);
//         await connection.query(`
//             UPDATE penitip
//             SET badge_level = 'TOP SELLER'
//             WHERE id_penitip = (
//                 SELECT id_penitip
//                 FROM penitip
//                 ORDER BY jml_barang_terjual_bulanan DESC
//                 LIMIT 1
//             )
//         `);

//         await connection.commit();

//         const [topSeller] = await connection.query(`
//             SELECT p.id_penitip, p.nama, p.email, p.jml_barang_terjual_bulanan
//             FROM penitip p
//             WHERE p.badge_level = 'TOP SELLER'
//             LIMIT 1
//         `);

//         return NextResponse.json({
//             success: true,
//             message: "Top Seller updated!",
//             top_seller: topSeller[0] || null,
//         }, { status: 200 });

//     } catch (err) {
//         await connection.rollback();
//         console.error("Error updating Top Seller:", err);
//         return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
//     } finally {
//         connection.release();
//     }
// }

export async function POST() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Reset badge
        await connection.query(`UPDATE penitip SET badge_level = 'novice'`);

        // 2. Update badge_level ke 'TOP SELLER' berdasarkan jml_barang_terjual_bulanan tertinggi
        // await connection.query(`
        //     UPDATE penitip
        //     SET badge_level = 'TOP SELLER'
        //     WHERE id_penitip = (
        //         SELECT id_penitip
        //         FROM penitip
        //         ORDER BY jml_barang_terjual_bulanan DESC
        //         LIMIT 1
        //     )
        // `);

        //Adjustment
        await connection.query(`
            UPDATE penitip
            JOIN (
                SELECT id_penitip FROM (
                    SELECT id_penitip
                    FROM penitip
                    ORDER BY jml_barang_terjual_bulanan DESC
                    LIMIT 1
                ) AS sub
            ) AS top
            ON penitip.id_penitip = top.id_penitip
            SET badge_level = 'TOP SELLER'
        `);

        // 3. Hitung total penjualan bulanan berdasarkan transaksi 'DONE'
        const [sales] = await connection.query(`
            SELECT pb.id_penitip, SUM(b.harga_barang) AS total_penjualan
            FROM barang b
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            JOIN bridgebarangtransaksi bbt ON b.id_barang = bbt.id_barang
            JOIN transaksi t ON t.id_transaksi = bbt.id_transaksi
            WHERE t.status_transaksi = 'DONE'
              AND MONTH(t.tanggal_lunas) = MONTH(CURRENT_DATE())
              AND YEAR(t.tanggal_lunas) = YEAR(CURRENT_DATE())
            GROUP BY pb.id_penitip
            ORDER BY total_penjualan DESC
            LIMIT 1
        `);

        const topSale = sales[0];

        if (topSale) {
            const bonus = topSale.total_penjualan * 0.01;

            // 4. Tambahkan bonus ke komisi
            await connection.query(`
                UPDATE penitip
                SET komisi = komisi + ?
                WHERE id_penitip = ?
            `, [bonus, topSale.id_penitip]);
        }

        await connection.commit();

        // 5. Ambil data top seller terbaru
        const [topSeller] = await connection.query(`
            SELECT id_penitip, nama, email, jml_barang_terjual_bulanan, komisi
            FROM penitip
            WHERE badge_level = 'TOP SELLER'
            LIMIT 1
        `);

        return NextResponse.json({
            success: true,
            message: `Top Seller updated! Bonus Rp${(topSale?.total_penjualan * 0.01).toLocaleString("id-ID") || 0} telah ditambahkan.`,
            top_seller: topSeller[0] || null,
        }, { status: 200 });

    } catch (err) {
        await connection.rollback();
        console.error("Error updating Top Seller:", err);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    } finally {
        connection.release();
    }
}
