import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
  const id_pengiriman = params.id;
  const { tanggal_kirim, id_kurir } = await request.json();

  if (!tanggal_kirim || !id_kurir) {
    return NextResponse.json({ error: "Field tanggal_kirim dan id_kurir wajib diisi." }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT t.tanggal_pesan, p.jenis_pengiriman 
      FROM pengiriman p 
      JOIN transaksi t ON p.id_transaksi = t.id_transaksi 
      WHERE p.id_pengiriman = ?
    `, [id_pengiriman]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Pengiriman tidak ditemukan." }, { status: 404 });
    }

    const { tanggal_pesan, jenis_pengiriman } = rows[0];

    if (jenis_pengiriman !== "COURIER") {
      return NextResponse.json({ error: "Penjadwalan hanya untuk pengiriman dengan jenis COURIER." }, { status: 400 });
    }

    const pesanDate = new Date(tanggal_pesan);
    const kirimDate = new Date(tanggal_kirim);

    const pesanHari = pesanDate.toISOString().split("T")[0];
    const kirimHari = kirimDate.toISOString().split("T")[0];
    const pesanJam = pesanDate.getHours();

    if (pesanHari === kirimHari && pesanJam >= 16) {
      return NextResponse.json({ error: "Pembelian setelah jam 4 sore tidak bisa dijadwalkan di hari yang sama." }, { status: 400 });
    }

    await pool.query(`
      UPDATE pengiriman 
      SET tanggal_kirim = ?, id_petugas_kurir = ?, status_pengiriman = 'IN_DELIVERY' 
      WHERE id_pengiriman = ?
    `, [tanggal_kirim, id_kurir, id_pengiriman]);

    return NextResponse.json({ message: "Jadwal pengiriman berhasil diperbarui!" });
  } catch (error) {
    console.error("PATCH /api/pengiriman/aturjadwal error:", error);
    return NextResponse.json({ error: "Gagal menjadwalkan pengiriman." }, { status: 500 });
  }
}
