import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  const { id } = params;
  const id_klaim = id;

  try {
    const { tanggal_ambil } = await request.json();

    if (!tanggal_ambil) {
      return NextResponse.json(
        { error: "Field tanggal_ambil wajib diisi" },
        { status: 400 }
      );
    }

    console.log(id_klaim);

    const [klaimCheck] = await pool.query(
      "SELECT * FROM klaim WHERE id_klaim = ?",
      [id_klaim]
    );

    console.log(klaimCheck);
    if (klaimCheck.length === 0) {
      return NextResponse.json({ error: "Klaim tidak ditemukan" }, { status: 404 });
    }

    await pool.query(
      "UPDATE klaim SET tanggal_ambil = ? WHERE id_klaim = ?",
      [tanggal_ambil, id_klaim]
    );

    return NextResponse.json({ message: "Tanggal ambil berhasil diatur" });
  } catch (error) {
    console.error("Atur Ambil Error:", error);
    return NextResponse.json(
      { error: "Gagal mengatur tanggal ambil" },
      { status: 500 }
    );
  }
}
