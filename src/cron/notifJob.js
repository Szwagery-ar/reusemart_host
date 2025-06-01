import cron from "node-cron";
import { sendPushNotification } from "../utils/sendNotifTitipan.js";
import pool from "../lib/db.js";

cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Cron test: tiap menit dijalankan");
});

// cron.schedule("0 7 * * *", async () => {
//   console.log("⏰ Memulai pengecekan masa titip barang...");

//   const query = `
//     SELECT 
//       b.id_barang,
//       b.nama_barang,
//       p.nama_penitip,
//       p.expo_push_token,
//       DATEDIFF(b.tanggal_expire, CURRENT_DATE()) AS sisa_hari
//     FROM barang b
//     JOIN penitip p ON b.id_penitip = p.id_penitip
//     WHERE DATEDIFF(b.tanggal_expire, CURRENT_DATE()) IN (3, 0)
//       AND b.status_titip IN ('AVAILABLE', 'HOLD', 'EXTENDED')
//       AND p.expo_push_token IS NOT NULL
//   `;

//   try {
//     const [rows]: any = await pool.query(query);

//     for (const item of rows) {
//       const message =
//         item.sisa_hari === 3
//           ? `Barang '${item.nama_barang}' akan habis masa titip dalam 3 hari.`
//           : `Hari ini masa titip barang '${item.nama_barang}' berakhir!`;

//       await sendPushNotification(item.expo_push_token, "📦 Masa Titip Barang", message);
//       console.log(`✅ Notifikasi dikirim ke ${item.nama_penitip}`);
//     }

//     console.log(`📨 Selesai. Total notifikasi: ${rows.length}`);
//   } catch (err) {
//     console.error("❌ Gagal menjalankan cron:", err);
//   }
// });
