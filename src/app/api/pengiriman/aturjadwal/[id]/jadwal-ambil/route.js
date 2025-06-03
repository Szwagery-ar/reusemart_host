import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendFirebasePushNotification } from "@/utils/sendFirebasePushNotification";

function formatDate(input) {
  const date = new Date(input);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const { tanggal_kirim } = await request.json();

  try {
    const [res] = await pool.query(
      `UPDATE pengiriman SET tanggal_kirim = ?, status_pengiriman = 'PICKED_UP' WHERE id_pengiriman = ?`,
      [tanggal_kirim, id]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔔 Kirim notifikasi ke pembeli
    const [pembeliRows] = await pool.query(
      `SELECT DISTINCT pb.expo_push_token, pb.nama AS nama_pembeli, pg.tanggal_kirim
        FROM pembeli pb
        JOIN transaksi t ON t.id_pembeli = pb.id_pembeli
        JOIN pengiriman pg ON pg.id_transaksi = t.id_transaksi
        WHERE pg.id_pengiriman = ? AND pb.expo_push_token IS NOT NULL
     `,
      [id]
    );

    for (const pembeli of pembeliRows) {
      await sendFirebasePushNotification(
        pembeli.expo_push_token,
        "Yuk, Ambil Barangmu!",
        `${pembeli.nama_pembeli}, silakan ambil pesananmu pada ${formatDate(
          tanggal_kirim
        )} di kantor ReUseMart ya!`
      );
    }

    // 🔔 Kirim notifikasi ke penitip barang dalam transaksi ini
    const [penitipRows] = await pool.query(
      `SELECT DISTINCT pt.expo_push_token, pt.nama AS nama_penitip, pg.tanggal_kirim
        FROM penitip pt
        JOIN barang b ON b.id_penitip = pt.id_penitip
        JOIN bridgebarangtransaksi bt ON bt.id_barang = b.id_barang
        JOIN transaksi t ON t.id_transaksi = bt.id_transaksi
        JOIN pengiriman pg ON pg.id_transaksi = t.id_transaksi
        WHERE pg.id_pengiriman = ? AND pt.expo_push_token IS NOT NULL
     `,

      //  SELECT DISTINCT pt.expo_push_token, pt.nama AS nama_penitip, pg.tanggal_kirim
      //     FROM penitip pt
      //     JOIN penitipanbarang pb ON pb.id_penitip = pt.id_penitip
      //     JOIN barang b ON b.id_barang = pb.id_barang
      //     JOIN bridgebarangtransaksi bt ON bt.id_barang = b.id_barang
      //     JOIN transaksi t ON t.id_transaksi = bt.id_transaksi
      //     JOIN pengiriman pg ON pg.id_transaksi = t.id_transaksi
      //     WHERE pg.id_pengiriman = ? AND pt.expo_push_token IS NOT NULL
      [id]
    );

    for (const penitip of penitipRows) {
      await sendFirebasePushNotification(
        penitip.expo_push_token,
        "Pengambilan Barang Dijadwalkan!",
        `${
          penitip.nama_penitip
        }, barang titipanmu akan diambil pembeli pada ${formatDate(
          tanggal_kirim
        )}.`
      );
    }

    return NextResponse.json({ message: "Jadwal ambil berhasil disimpan" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menyimpan jadwal ambil" },
      { status: 500 }
    );
  }
}
