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
  const id_pengiriman = params.id;
  const { tanggal_kirim } = await request.json();

  if (!tanggal_kirim) {
    return NextResponse.json(
      { error: "Field tanggal_kirim diisi." },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT t.tanggal_pesan, p.jenis_pengiriman 
      FROM pengiriman p 
      JOIN transaksi t ON p.id_transaksi = t.id_transaksi 
      WHERE p.id_pengiriman = ?
    `,
      [id_pengiriman]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Pengiriman tidak ditemukan." },
        { status: 404 }
      );
    }

    const { tanggal_pesan, jenis_pengiriman } = rows[0];

    if (jenis_pengiriman !== "COURIER") {
      return NextResponse.json(
        { error: "Penjadwalan hanya untuk pengiriman dengan jenis COURIER." },
        { status: 400 }
      );
    }

    const pesanDate = new Date(tanggal_pesan);
    const kirimDate = new Date(tanggal_kirim);

    const pesanHari = pesanDate.toISOString().split("T")[0];
    const kirimHari = kirimDate.toISOString().split("T")[0];
    const pesanJam = pesanDate.getHours();

    if (pesanHari === kirimHari && pesanJam >= 16) {
      return NextResponse.json(
        {
          error:
            "Pembelian setelah jam 4 sore tidak bisa dijadwalkan di hari yang sama.",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `
      UPDATE pengiriman 
      SET tanggal_kirim = ?, status_pengiriman = 'IN_DELIVERY'
      WHERE id_pengiriman = ?
    `,
      [tanggal_kirim, id_pengiriman]
    );

    // 🔔 Kirim notifikasi ke pembeli
    const [pembeliRows] = await pool.query(
      `SELECT DISTINCT pb.expo_push_token, pb.nama AS nama_pembeli, pg.tanggal_kirim
        FROM pembeli pb
        JOIN transaksi t ON t.id_pembeli = pb.id_pembeli
        JOIN pengiriman pg ON pg.id_transaksi = t.id_transaksi
        WHERE pg.id_pengiriman = ? AND pb.expo_push_token IS NOT NULL
     `,
      [id_pengiriman]
    );

    for (const pembeli of pembeliRows) {
      await sendFirebasePushNotification(
        pembeli.expo_push_token,
        "Pesananmu Dijadwalkan!",
        `${
          pembeli.nama_pembeli
        }, pesananmu telah dijadwalkan untuk pengiriman pada ${formatDate(
          tanggal_kirim
        )}.`
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
      [id_pengiriman]
    );

    for (const penitip of penitipRows) {
      await sendFirebasePushNotification(
        penitip.expo_push_token,
        "Pengiriman Barang Dijadwalkan!",
        `${
          penitip.nama_penitip
        }, barang titipanmu akan dikirim ke pembeli pada ${formatDate(
          tanggal_kirim
        )}.`
      );
    }

    // 🔔 Kirim notifikasi ke pembeli
    const [kurirRows] = await pool.query(
      `SELECT DISTINCT pgw.expo_push_token, pgw.nama AS nama_kurir, pg.tanggal_kirim
        FROM pegawai pgw
        JOIN pengiriman pg ON pg.id_petugas_kurir = pgw.id_pegawai
        WHERE pg.id_pengiriman = ? AND pgw.expo_push_token IS NOT NULL
     `,
      [id_pengiriman]
    );

    for (const kurir of kurirRows) {
      await sendFirebasePushNotification(
        kurir.expo_push_token,
        "Ready, Set, Go!",
        `${
          kurir.nama_kurir
        }, pengiriman telah dijadwalkan pada ${formatDate(
          kurir.tanggal_kirim
        )}.`
      );
    }

    return NextResponse.json({
      message: "Jadwal pengiriman berhasil diperbarui!",
    });
  } catch (error) {
    console.error("PATCH /api/pengiriman/aturjadwal error:", error);
    return NextResponse.json(
      { error: "Gagal menjadwalkan pengiriman." },
      { status: 500 }
    );
  }
}
