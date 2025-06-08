import { sendFirebasePushNotification } from "../../utils/sendFirebasePushNotification.js";
import pool from "../../lib/db.js";

export async function cronTitipanHariH() {
  const [rows] = await pool.query(`
    SELECT b.nama_barang, b.tanggal_expire, p.expo_push_token, p.nama
    FROM barang b
    LEFT JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
    LEFT JOIN penitip p ON pb.id_penitip = p.id_penitip
    WHERE DATEDIFF(b.tanggal_expire, CURRENT_DATE()) = 0
      AND b.status_titip IN ('AVAILABLE', 'EXTENDED')
      AND p.expo_push_token IS NOT NULL
  `);

  // Debug
  // console.log("📦 Rows Habis:", rows.length);

  for (const row of rows) {
    await sendFirebasePushNotification(
      row.expo_push_token,
      "Barang Titipan Berakhir Hari Ini",
      `${row.nama}, hari ini adalah hari terakhir penitipan '${row.nama_barang}'.`
    );
  }
}
