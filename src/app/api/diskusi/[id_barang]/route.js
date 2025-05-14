import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req, context) {
  try {
    const { id_barang } = context.params;

    const [diskusi] = await pool.query(
      `SELECT 
          d.id_diskusi, 
          d.isi_diskusi, 
          d.tanggal,
          b.nama_barang,

          COALESCE(p.nama, pen.nama, peg.nama) AS nama_pengirim,
          COALESCE(p.src_img_profile, pen.src_img_profile, peg.src_img_profile) AS foto_pengirim,

          CASE 
            WHEN d.id_pembeli IS NOT NULL THEN 'Pembeli'
            WHEN d.id_penitip IS NOT NULL THEN 'Penitip'
            WHEN d.id_pegawai IS NOT NULL THEN CONCAT('Pegawai - ', j.nama_jabatan)
            ELSE 'Tidak diketahui'
          END AS role_pengirim

      FROM diskusi d
      JOIN barang b ON d.id_barang = b.id_barang
      LEFT JOIN pembeli p ON d.id_pembeli = p.id_pembeli
      LEFT JOIN penitip pen ON d.id_penitip = pen.id_penitip
      LEFT JOIN pegawai peg ON d.id_pegawai = peg.id_pegawai
      LEFT JOIN jabatan j ON peg.id_jabatan = j.id_jabatan

      WHERE d.id_barang = ?
      ORDER BY d.tanggal`,
      [id_barang]
    );

    return NextResponse.json({ diskusi }, { status: 200 });
  } catch (error) {
    console.error("Error fetching diskusi:", error);
    return NextResponse.json(
      { error: "Failed to fetch Diskusi" },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  try {
    const { id_barang } = context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Pastikan pakai .env
    const user = decoded; // Dapatkan user.id dan user.role

    const { isi_diskusi } = await request.json();

    if (!id_barang || !isi_diskusi) {
      return NextResponse.json({ error: "id_barang dan isi_diskusi harus diisi" }, { status: 400 });
    }

    // Tentukan siapa pengirimnya
    const id_pembeli = user.role === "pembeli" ? user.id : null;
    const id_penitip = user.role === "penitip" ? user.id : null;
    const id_pegawai = user.role === "pegawai" ? user.id : null;

    const role = (user.role).toUpperCase();

    await pool.query(
      `INSERT INTO diskusi (id_barang, id_pembeli, id_penitip, id_pegawai, jenis_user, isi_diskusi)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_barang, id_pembeli, id_penitip, id_pegawai, role, isi_diskusi]
    );

    return NextResponse.json({ message: "Diskusi berhasil dibuat!" }, { status: 201 });
  } catch (error) {
    console.error("POST diskusi error:", error);
    return NextResponse.json({ error: "Gagal membuat diskusi" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id_diskusi, isi_diskusi } = await request.json();

    if (!id_diskusi || !isi_diskusi) {
      return NextResponse.json(
        { error: "id_diskusi and isi_diskusi are required!" },
        { status: 400 }
      );
    }

    const [diskusiExists] = await pool.query(
      "SELECT * FROM diskusi WHERE id_diskusi = ?",
      [id_diskusi]
    );

    if (diskusiExists.length === 0) {
      return NextResponse.json(
        { error: "Diskusi not found!" },
        { status: 404 }
      );
    }

    await pool.query(
      "UPDATE diskusi SET isi_diskusi = ? WHERE id_diskusi = ?",
      [isi_diskusi, id_diskusi]
    );

    return NextResponse.json(
      { message: "Diskusi updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update Diskusi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_diskusi } = await request.json();

    if (!id_diskusi) {
      return NextResponse.json(
        { error: "id_diskusi is required!" },
        { status: 400 }
      );
    }

    const [diskusiExists] = await pool.query(
      "SELECT * FROM diskusi WHERE id_diskusi = ?",
      [id_diskusi]
    );

    if (diskusiExists.length === 0) {
      return NextResponse.json(
        { error: "Diskusi not found!" },
        { status: 404 }
      );
    }

    await pool.query("DELETE FROM diskusi WHERE id_diskusi = ?", [id_diskusi]);

    return NextResponse.json(
      { message: "Diskusi deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete Diskusi" },
      { status: 500 }
    );
  }
}
