import pool from "../../lib/db.js";
import { sendFirebasePushNotification } from "../../utils/sendFirebasePushNotification.js";

function formatDateForComparison(date) {
  return date.toISOString().split("T")[0];
}

export async function hanguskanTransaksiSelfPickup() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 2);
  const formattedDate = formatDateForComparison(targetDate);

  try {
    const [pengirimanRows] = await pool.query(`
      SELECT pg.id_pengiriman, pg.id_transaksi, t.id_pembeli, p.expo_push_token, p.nama
      FROM pengiriman pg
      JOIN transaksi t ON pg.id_transaksi = t.id_transaksi
      JOIN pembeli p ON t.id_pembeli = p.id_pembeli
      WHERE pg.jenis_pengiriman = 'SELF_PICKUP'
        AND pg.status_pengiriman = 'PICKED_UP'
        AND DATE(pg.tanggal_kirim) <= ?
    `, [formattedDate]);

    for (const row of pengirimanRows) {
      const { id_pengiriman, id_transaksi, expo_push_token, nama } = row;

      // 1. CANCEL transaksi
      await pool.query(`
        UPDATE transaksi SET status_transaksi = 'CANCELLED' WHERE id_transaksi = ?
      `, [id_transaksi]);

      // 2. Barang dalam transaksi → DONATABLE
      await pool.query(`
        UPDATE barang b
        JOIN bridgebarangtransaksi bt ON bt.id_barang = b.id_barang
        SET b.status_titip = 'DONATABLE'
        WHERE bt.id_transaksi = ?
      `, [id_transaksi]);

      // 3. Update pengiriman → FAILED
      await pool.query(`
        UPDATE pengiriman SET status_pengiriman = 'FAILED' WHERE id_pengiriman = ?
      `, [id_pengiriman]);

      // 4. Kirim notifikasi ke pembeli
      if (expo_push_token) {
        await sendFirebasePushNotification(
          expo_push_token,
          "Transaksi Dibatalkan",
          `${nama}, transaksi Anda dibatalkan karena tidak diambil dalam 2 hari setelah dijadwalkan.`
        );
      }
    }

    console.log(`✅ Berhasil menghanguskan ${pengirimanRows.length} transaksi SELF_PICKUP.`);
  } catch (error) {
    console.error("❌ Gagal menjalankan cron SELF_PICKUP:", error);
  }
}
