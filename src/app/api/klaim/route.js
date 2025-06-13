import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
      SELECT 
        k.id_klaim,
        k.id_pembeli,
        k.id_merchandise,
        k.jml_merch_diklaim,
        k.total_poin,
        k.tanggal_klaim,
        k.tanggal_ambil,
        k.status,
        m.nama_merch,
        p.nama AS nama_pembeli
      FROM klaim k
      JOIN merchandise m ON k.id_merchandise = m.id_merchandise
      JOIN pembeli p ON k.id_pembeli = p.id_pembeli
    `;
    const values = [];

    if (search) {
      query += ` WHERE p.nama LIKE ? OR m.nama_merch LIKE ?`;
      values.push(`%${search}%`, `%${search}%`);
    }

    const [klaim] = await pool.query(query, values);

    return NextResponse.json({ klaim }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Klaim" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const connection = await pool.getConnection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - no token" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_pembeli = decoded.id;
    const role = decoded.role;

    if (role !== "pembeli") {
      return NextResponse.json(
        { error: "Unauthorized - not a Pembeli" },
        { status: 403 }
      );
    }

    const { id_merchandise, jml_merch_diklaim } = await request.json();

    const merchId = parseInt(id_merchandise);
    const jumlahKlaim = parseInt(jml_merch_diklaim);

    if (!merchId || isNaN(merchId) || isNaN(jumlahKlaim) || jumlahKlaim <= 0) {
      return NextResponse.json({ error: "Field tidak valid" }, { status: 400 });
    }

    await connection.beginTransaction();

    const [[pembeli]] = await connection.query(
      "SELECT poin_loyalitas FROM pembeli WHERE id_pembeli = ?",
      [id_pembeli]
    );

    if (!pembeli) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Pembeli tidak ditemukan." },
        { status: 404 }
      );
    }

    const [[merch]] = await connection.query(
      "SELECT jumlah_poin, jumlah_stok FROM merchandise WHERE id_merchandise = ?",
      [merchId]
    );

    if (!merch) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Merchandise tidak ditemukan." },
        { status: 404 }
      );
    }

    const totalPoinDibutuhkan = merch.jumlah_poin * jumlahKlaim;

    if (pembeli.poin_loyalitas < totalPoinDibutuhkan) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Poin tidak mencukupi untuk klaim." },
        { status: 400 }
      );
    }

    if (merch.jumlah_stok < jumlahKlaim) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Stok merchandise tidak mencukupi." },
        { status: 400 }
      );
    }

    // Simpan klaim
    await connection.query(
      `INSERT INTO klaim (id_pembeli, id_merchandise, jml_merch_diklaim, total_poin) 
             VALUES (?, ?, ?, ?)`,
      [id_pembeli, merchId, jumlahKlaim, totalPoinDibutuhkan]
    );

    await connection.query(
      "UPDATE pembeli SET poin_loyalitas = poin_loyalitas - ? WHERE id_pembeli = ?",
      [totalPoinDibutuhkan, id_pembeli]
    );

    await connection.query(
      "UPDATE merchandise SET jumlah_stok = jumlah_stok - ? WHERE id_merchandise = ?",
      [jumlahKlaim, merchId]
    );

    await connection.commit();

    return NextResponse.json(
      { message: "Klaim berhasil dibuat!" },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("KLAIM ERROR:", error); // <- cetak error ke server log
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat membuat klaim." },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function PUT(request) {
  try {
    const {
      id_klaim,
      id_pembeli,
      id_merchandise,
      jml_merch_diklaim,
      total_poin,
    } = await request.json();

    if (
      !id_klaim ||
      !id_pembeli ||
      !id_merchandise ||
      !jml_merch_diklaim ||
      !total_poin
    ) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    const [klaimExists] = await pool.query(
      "SELECT * FROM klaim WHERE id_klaim = ?",
      [id_klaim]
    );

    if (klaimExists.length === 0) {
      return NextResponse.json({ error: "Klaim not found!" }, { status: 404 });
    }

    const [pembeli] = await pool.query(
      "SELECT poin_loyalitas FROM pembeli WHERE id_pembeli = ?",
      [id_pembeli]
    );

    if (pembeli.length === 0) {
      return NextResponse.json(
        { error: "Pembeli not found!" },
        { status: 404 }
      );
    }

    if (pembeli[0].poin_loyalitas < total_poin) {
      return NextResponse.json(
        { error: "Not enough points to update the claim!" },
        { status: 400 }
      );
    }

    await pool.query(
      "UPDATE klaim SET id_pembeli = ?, id_merchandise = ?, jml_merch_diklaim = ?, total_poin = ? WHERE id_klaim = ?",
      [id_pembeli, id_merchandise, jml_merch_diklaim, total_poin, id_klaim]
    );

    await pool.query(
      "UPDATE pembeli SET poin_loyalitas = poin_loyalitas - ? WHERE id_pembeli = ?",
      [total_poin, id_pembeli]
    );

    return NextResponse.json(
      { message: "Klaim updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update Klaim" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_klaim } = await request.json();

    if (!id_klaim) {
      return NextResponse.json(
        { error: "id_klaim is required!" },
        { status: 400 }
      );
    }

    const [klaimExists] = await pool.query(
      "SELECT * FROM klaim WHERE id_klaim = ?",
      [id_klaim]
    );

    if (klaimExists.length === 0) {
      return NextResponse.json({ error: "Klaim not found!" }, { status: 404 });
    }

    const [klaim] = await pool.query(
      "SELECT total_poin, id_pembeli FROM klaim WHERE id_klaim = ?",
      [id_klaim]
    );

    await pool.query(
      "UPDATE pembeli SET poin_loyalitas = poin_loyalitas + ? WHERE id_pembeli = ?",
      [klaim[0].total_poin, klaim[0].id_pembeli]
    );

    await pool.query("DELETE FROM klaim WHERE id_klaim = ?", [id_klaim]);

    return NextResponse.json(
      { message: "Klaim deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete Klaim" },
      { status: 500 }
    );
  }
}
