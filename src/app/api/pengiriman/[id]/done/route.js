import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const [updateResult] = await pool.query(
      `UPDATE pengiriman SET status_pengiriman = 'DONE', tanggal_terima = NOW() WHERE id_pengiriman = ?`,
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ error: "Pengiriman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status pengiriman diperbarui menjadi DONE" }, { status: 200 });
  } catch (error) {
    console.error("Gagal update status pengiriman:", error);
    return NextResponse.json({ error: "Gagal update status pengiriman" }, { status: 500 });
  }
}
