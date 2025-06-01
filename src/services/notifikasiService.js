import pool from "../lib/db.js";

export async function ambilBarangHampirExpire() {
  const [rows] = await pool.query(`
    SELECT b.nama_barang, b.tanggal_expire, p.expo_push_token, p.nama
    FROM barang b
    JOIN penitip p ON b.id_penitip = p.id_penitip
    WHERE DATEDIFF(b.tanggal_expire, CURRENT_DATE()) BETWEEN 0 AND 3
      AND p.expo_push_token IS NOT NULL
  `);

  return rows;
}