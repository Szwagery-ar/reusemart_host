import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendFirebasePushNotification } from "@/utils/sendFirebasePushNotification";

export async function PATCH(request, { params }) {
  const id_pembayaran = params.id;
  const { status_pembayaran, id_petugas_cs } = await request.json();

  if (!["CONFIRMED", "FAILED"].includes(status_pembayaran)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id_transaksi FROM pembayaran WHERE id_pembayaran = ?`,
      [id_pembayaran]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Pembayaran tidak ditemukan." },
        { status: 404 }
      );
    }

    const id_transaksi = rows[0].id_transaksi;

    await pool.query(
      `UPDATE pembayaran 
        SET status_pembayaran = ?, id_petugas_cs = ? 
        WHERE id_pembayaran = ?`,
      [status_pembayaran, id_petugas_cs, id_pembayaran]
    );

    if (status_pembayaran === "CONFIRMED") {
      // ✅ Konfirmasi berhasil → transaksi PAID, barang SOLD
      await pool.query(
        `UPDATE transaksi 
          SET status_transaksi = 'PAID', tanggal_lunas = CURRENT_TIMESTAMP 
          WHERE id_transaksi = ?`,
        [id_transaksi]
      );

      await pool.query(
        `UPDATE barang b
          JOIN bridgebarangtransaksi bt ON bt.id_barang = b.id_barang
          SET b.status_titip = 'SOLD', b.tanggal_keluar = CURRENT_TIMESTAMP
          WHERE bt.id_transaksi = ?`,
        [id_transaksi]
      );

      const [[trxData]] = await pool.query(
        `SELECT id_pembeli, tambahan_poin FROM transaksi WHERE id_transaksi = ?`,
        [id_transaksi]
      );

      const { id_pembeli, tambahan_poin } = trxData;

      // Tambah poin loyalitas ke pembeli
      await pool.query(
        `UPDATE pembeli 
          SET pembeli.poin_loyalitas = poin_loyalitas + ? 
          WHERE id_pembeli = ?`,
        [tambahan_poin, id_pembeli]
      );

      console.log(
        `Poin loyalitas ${tambahan_poin} berhasil ditambahkan ke pembeli ${id_pembeli}`
      );

      // 🔔 Kirim notifikasi ke semua penitip barang dalam transaksi ini
      const [penitipRows] = await pool.query(
        `SELECT DISTINCT p.expo_push_token, p.nama AS nama_penitip, b.nama_barang
          FROM barang b
          JOIN penitip p ON b.id_penitip = p.id_penitip
          JOIN bridgebarangtransaksi bt ON bt.id_barang = b.id_barang
          WHERE bt.id_transaksi = ? AND p.expo_push_token IS NOT NULL`,
        [id_transaksi]
      );

      for (const penitip of penitipRows) {
        await sendFirebasePushNotification(
          penitip.expo_push_token,
          "Barang Anda Terjual!",
          `${penitip.nama_penitip}, barang '${penitip.nama_barang}' milik Anda telah berhasil terjual!`
        );
      }

      // Hitung komisi
      const resKomisi = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/komisi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_transaksi }),
        }
      );

      const resultKomisi = await resKomisi.json();
      if (!resKomisi.ok) {
        console.warn("Komisi gagal dihitung:", resultKomisi.error);
      }
    }

    if (status_pembayaran === "FAILED") {
      // ❌ Pembayaran gagal → transaksi CANCELLED, barang AVAILABLE
      await pool.query(
        `UPDATE transaksi 
                 SET status_transaksi = 'CANCELLED' 
                 WHERE id_transaksi = ?`,
        [id_transaksi]
      );

      await pool.query(
        `UPDATE barang b
                 JOIN bridgebarangtransaksi bt ON bt.id_barang = b.id_barang
                 SET b.status_titip = 'AVAILABLE'
                 WHERE bt.id_transaksi = ?`,
        [id_transaksi]
      );
    }

    return NextResponse.json({
      message: "Status pembayaran & transaksi berhasil diperbarui.",
    });
  } catch (err) {
    console.error("PATCH /api/pembayaran/konfirmasi/[id] error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}
