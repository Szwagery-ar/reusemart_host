import pool from "@/lib/db";
import { sendPushNotification } from "@/utils/sendPushNotificationServer"; // ini versi server, bukan dari frontend

export async function GET() {
  const query = `
    SELECT 
      b.id_barang,
      b.nama_barang,
      b.tanggal_masuk,
      b.tanggal_expire,
      p.nama_penitip,
      p.expo_push_token
    FROM barang b
    JOIN penitip p ON b.id_penitip = p.id_penitip
    WHERE b.tanggal_expire < CURRENT_DATE
      AND b.status_titip IN ('AVAILABLE', 'HOLD', 'EXTENDED')
      AND p.expo_push_token IS NOT NULL;
  `;

  try {
    const [rows] = await pool.query(query);

    for (const item of rows) {
      const message =
        item.sisa_hari === 3
          ? `Barang '${item.nama_barang}' akan habis masa titip dalam 3 hari.`
          : `Hari ini masa titip barang '${item.nama_barang}' berakhir!`;

      await sendPushNotification(
        item.expo_push_token,
        "📦 Masa Titip Barang",
        message
      );
    }

    return new Response(JSON.stringify({ success: true, sent: rows.length }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Gagal kirim notifikasi:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
