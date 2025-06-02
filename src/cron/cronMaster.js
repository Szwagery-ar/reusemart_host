import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";
import { cronTitipanH3 } from "./barang/cekTitipanHampirExpired.js";
import { cronTitipanHariH } from "./barang/cekTitipanExpired.js";

console.log("🚀 Cron Master dijalankan");

setTimeout(() => {
  cron.schedule("0 6 * * *", async () => { // Dikirim setiap hari jam 06:00
    console.log(`[${new Date().toISOString()}] ⏰ Menjalankan semua cron harian...`);
    await cronTitipanH3();
    await cronTitipanHariH();

    // Tambahkan lainnya nanti seperti:
    // await cronPengirimanMasuk();
    // await cronTransaksiMelewatiBatas();
  });
}, 1000);
