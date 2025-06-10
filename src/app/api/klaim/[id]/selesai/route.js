import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(_, { params }) {
  const { id } = params;
  const id_klaim = id;

  try {
    const [klaimCheck] = await pool.query(
      "SELECT * FROM klaim WHERE id_klaim = ?",
      [id_klaim]
    );

    if (klaimCheck.length === 0) {
      return NextResponse.json({ error: "Klaim tidak ditemukan" }, { status: 404 });
    }

    await pool.query(
      "UPDATE klaim SET status = 'SUDAH DIAMBIL' WHERE id_klaim = ?",
      [id_klaim]
    );

    return NextResponse.json({ message: "Klaim ditandai sudah diambil" });
  } catch (error) {
    console.error("Selesai Klaim Error:", error);
    return NextResponse.json(
      { error: "Gagal menyelesaikan klaim" },
      { status: 500 }
    );
  }
}
