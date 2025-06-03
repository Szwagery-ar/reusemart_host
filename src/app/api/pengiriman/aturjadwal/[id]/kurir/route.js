import pool from "@/lib/db";
import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const [kurirRows] = await pool.query(`
      SELECT id_pegawai, nama
      FROM pegawai
      join jabatan jp on pegawai.id_jabatan = jp.id_jabatan
      WHERE nama_jabatan = 'Kurir'
    `);

    return NextResponse.json({ kurir: kurirRows });
  } catch (err) {
    console.error("GET /api/pengiriman/aturjadwal/[id]/kurir error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data kurir" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const { id_kurir } = await request.json();

  if (!id_kurir) {
    return NextResponse.json(
      { error: "ID kurir wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const [updateResult] = await pool.query(
      `UPDATE pengiriman 
       SET id_petugas_kurir = ?, status_pengiriman = 'IN_PROGRESS'
       WHERE id_pengiriman = ?`,
      [id_kurir, id]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pengiriman tidak ditemukan." },
        { status: 404 }
      );
    }

    // 🔔 Kirim notifikasi ke kurir
    const [pegawaiRows] = await pool.query(
      `SELECT DISTINCT pgw.expo_push_token, pgw.nama AS nama_pegawai, pg.tanggal_kirim
        FROM pegawai pgw
        JOIN pengiriman pg ON pg.id_petugas_kurir = pgw.id_pegawai
        WHERE pg.id_pengiriman = ? AND pgw.expo_push_token IS NOT NULL
     `,
      [id]
    );

    for (const pegawai of pegawaiRows) {
      await sendFirebasePushNotification(
        pegawai.expo_push_token,
        "Ada Pengiriman Baru!",
        `Siap-siap ya, ${
          pegawai.nama_pegawai
        }. Akan ada pengiriman baru yang harus kamu antar.`
      );
    }

    return NextResponse.json({
      message: "Kurir ditetapkan.",
    });
  } catch (error) {
    console.error("PATCH /pengiriman/aturjadwal/[id]/kurir error:", error);
    return NextResponse.json(
      { error: "Gagal menetapkan kurir dan mengubah status." },
      { status: 500 }
    );
  }
}
