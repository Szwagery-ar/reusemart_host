import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";
import { cronTitipanH3 } from "./barang/cekTitipanHampirExpired.js";
import { cronTitipanHariH } from "./barang/cekTitipanExpired.js";
import { hanguskanTransaksiSelfPickup } from "./pengiriman/hanguskanPengambilan.js";

console.log("🚀 Cron Master dijalankan");

setTimeout(() => {
  cron.schedule("8 * * * *", async () => { // Dikirim setiap hari jam 06:00
    console.log(`[${new Date().toISOString()}] ⏰ Menjalankan semua cron pukul 06.00...`);
    await cronTitipanH3();
    await cronTitipanHariH();
  });
  cron.schedule("0 18 * * *", async () => { // Dikirim setiap hari jam 18:00
    console.log(`[${new Date().toISOString()}] ⏰ Menjalankan semua cron pukul 18.00...`);
    await hanguskanTransaksiSelfPickup();
  });
}, 1000);
