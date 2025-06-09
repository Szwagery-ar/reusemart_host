import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { sendFirebasePushNotification } from "@/utils/sendFirebasePushNotification";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(request, context) {
  const { id } = context.params;
  const id_pengiriman = id;

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_petugas_kurir = decoded.id;

    const [updateResult] = await pool.query(
      `UPDATE 
        pengiriman SET status_pengiriman = 'DONE', 
        tanggal_terima = NOW() 
      WHERE id_pengiriman = ? AND id_petugas_kurir = ?
      `,
      [id_pengiriman, id_petugas_kurir]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengiriman tidak ditemukan atau bukan milik Anda",
        },
        { status: 404 }
      );
    }

    // 1. Ambil id_transaksi_pembelian
    const [pengirimanRows] = await pool.query(
      `SELECT id_transaksi FROM pengiriman WHERE id_pengiriman = ?`,
      [id_pengiriman]
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
       JOIN penitipanbarang pb ON pb.id_penitipan = b.id_penitipan
       JOIN penitip p ON pb.id_penitip = p.id_penitip
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

    return new Response(JSON.stringify({ success: true  }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gagal menyelesaikan pengiriman:", error);
    return NextResponse.json(
      { error: "Gagal menyelesaikan pengiriman" },
      { status: 500 }
    );
  }
}
