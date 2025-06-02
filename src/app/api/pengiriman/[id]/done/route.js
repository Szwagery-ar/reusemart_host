import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendFirebasePushNotification } from "@/utils/sendFirebasePushNotification";

export async function PATCH(request, context) {
  const { id } = context.params;

  try {
    const [updateResult] = await pool.query(
      `UPDATE pengiriman SET status_pengiriman = 'DONE', tanggal_terima = NOW() WHERE id_pengiriman = ?`,
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pengiriman tidak ditemukan" },
        { status: 404 }
      );
    }

    // 1. Ambil id_transaksi_pembelian
    const [pengirimanRows] = await pool.query(
      `SELECT id_transaksi FROM pengiriman WHERE id_pengiriman = ?`,
      [id]
    );

    const idTransaksi = pengirimanRows[0]?.id_transaksi;

    if (!idTransaksi)
      throw new Error("Transaksi tidak ditemukan dari pengiriman ini");

    // ✅ Update status transaksi menjadi DONE
    await pool.query(
      `UPDATE transaksi SET status_transaksi = 'DONE' WHERE id_transaksi = ?`,
      [idTransaksi]
    );

    // 2. Ambil token pembeli
    const [pembeliRows] = await pool.query(
      `SELECT p.expo_push_token, p.nama 
       FROM pembeli p
       JOIN transaksi t ON t.id_pembeli = p.id_pembeli
       WHERE t.id_transaksi = ?`,
      [idTransaksi]
    );

    if (pembeliRows.length > 0) {
      const { expo_push_token, nama } = pembeliRows[0];

      if (expo_push_token) {
        await sendFirebasePushNotification(
          expo_push_token,
          "Hore, Barangnya Sudah Sampai 🎉",
          `${nama}, barangmu sudah sampai. Terima kasih telah berbelanja di ReuseMart!`
        );
      }
    }

    // 3. Ambil barang + penitip dari detail transaksi
    const [barangRows] = await pool.query(
      `SELECT b.nama_barang, p.expo_push_token, p.nama AS nama_penitip
       FROM transaksi t
       JOIN bridgebarangtransaksi bbt ON bbt.id_transaksi = t.id_transaksi
       JOIN barang b ON b.id_barang = bbt.id_barang
       JOIN penitip p ON b.id_penitip = p.id_penitip
       WHERE t.id_transaksi = ?`,
      [idTransaksi]
    );

    for (const { nama_barang, expo_push_token, nama_penitip } of barangRows) {
      if (expo_push_token) {
        await sendFirebasePushNotification(
          expo_push_token,
          "Barang Anda Telah Diterima Pembeli",
          `${nama_penitip}, barang '${nama_barang}' yang Anda titipkan telah diterima oleh pembeli!`
        );
      }
    }

    return NextResponse.json(
      { message: "Status pengiriman diperbarui & notifikasi dikirim" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Gagal update status pengiriman:", error);
    return NextResponse.json(
      { error: "Gagal update status pengiriman" },
      { status: 500 }
    );
  }
}
