import { ambilBarangHampirExpire } from "../services/notifikasiService.js";

import dotenv from "dotenv";
dotenv.config();
console.log("✅ ENV Loaded:", {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  pass: process.env.DATABASE_PASSWORD,
  db: process.env.DATABASE_NAME,
});

import cron from "node-cron";
import pool from "../lib/db.js";
import { sendPushNotification } from "../utils/sendPushNotification.js";
import { sendFirebasePushNotification } from "../utils/sendFirebasePushNotification.js";

function formatDatetime(datetimeInput) {
  let date;

  // Kalau input sudah Date object
  if (datetimeInput instanceof Date) {
    date = datetimeInput;
  }
  // Kalau input string
  else if (typeof datetimeInput === "string") {
    const safeStr = datetimeInput.replace(" ", "T");
    date = new Date(safeStr);
  } else {
    return "Invalid Date";
  }

  if (isNaN(date.getTime())) return "Invalid Date";

  const options = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
}

setTimeout(() => {
  cron.schedule("* * * * *", async () => {
    console.log(`[${new Date().toISOString()}] 🚀 Notifikasi dikirim`);

    try {
      const rows = await ambilBarangHampirExpire();
      console.log("📦 Rows:", rows.length);

      for (const row of rows) {
        await sendFirebasePushNotification(
          row.expo_push_token,
          "Barang Titipan Hampir Expire",
            row.nama_barang +
            " akan expire pada " +
            formatDatetime(row.tanggal_expire.toISOString()) +
            ". Mau diperpanjang?"
        );

        // await sendPushNotification(
        //   "ExponentPushToken[vu6A8YHCujKCRjuTVbPXgT]",
        //   "Hai! 👋",
        //   "Ini dikirim dari backend universal!"
        // );
      }
    } catch (err) {
      console.error("❌ Error saat eksekusi cron:", err);
    }
  });
}, 1000);
