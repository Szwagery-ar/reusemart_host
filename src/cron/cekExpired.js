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

setTimeout(() => {
  cron.schedule("* * * * *", async () => {
    console.log(`[${new Date().toISOString()}] 🚀 Notifikasi dikirim`);

    try {
      const rows = await ambilBarangHampirExpire();
      console.log("📦 Rows:", rows.length);

      // for (const row of rows) {
        await sendPushNotification(
          "ExponentPushToken[vu6A8YHCujKCRjuTVbPXgT]",
          "Pengingat Titipan",
          "Masa titip segera habis!"
        );
      // }
    } catch (err) {
      console.error("❌ Error saat eksekusi cron:", err);
    }
  });
}, 1000);
