import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - no token" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_penitip = decoded.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
      SELECT 
        t.id_transaksi,
        t.no_nota,
        t.tanggal_pesan,
        b.nama_barang,
        b.harga_barang,
        p.nama AS nama_pembeli,
        t.status_transaksi,
        k.komisi_penitip
      FROM transaksi t
      JOIN barang b ON b.id_transaksi = t.id_transaksi
      JOIN pembeli p ON t.id_pembeli = p.id_pembeli
      JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
      JOIN penitip pt ON pb.id_penitip = pt.id_penitip
      LEFT JOIN (
        SELECT DISTINCT id_transaksi, komisi_penitip
        FROM komisi
      ) k ON t.id_transaksi = k.id_transaksi
      WHERE pt.id_penitip = ?
    `;

    let values = [id_penitip];

    if (search) {
      query += `
        AND (
          t.no_nota LIKE ?
          OR b.nama_barang LIKE ?
          OR p.nama LIKE ?
        )
      `;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.tanggal_pesan DESC`;

    const [rows] = await pool.query(query, values);

    const transaksiMap = new Map();

    for (const row of rows) {
      if (!transaksiMap.has(row.id_transaksi)) {
        transaksiMap.set(row.id_transaksi, {
          id_transaksi: row.id_transaksi,
          no_nota: row.no_nota,
          tanggal_pesan: row.tanggal_pesan,
          nama_pembeli: row.nama_pembeli,
          status_transaksi: row.status_transaksi,
          komisi_penitip: row.komisi_penitip,
          barang: [],
          total_harga: 0,
        });
      }

      const transaksi = transaksiMap.get(row.id_transaksi);

      const barangKey = `${row.nama_barang}-${row.harga_barang}`;
      const barangSudahAda = transaksi.barang.some(
        (b) => `${b.nama_barang}-${b.harga_barang}` === barangKey
      );

      if (!barangSudahAda) {
        transaksi.barang.push({
          nama_barang: row.nama_barang,
          harga_barang: row.harga_barang,
        });
        transaksi.total_harga += Number(row.harga_barang);
      }

      transaksi.total_harga += parseFloat(row.harga_barang || 0);
    }

    console.log(transaksiMap);

    return NextResponse.json(
      { transaksi: Array.from(transaksiMap.values()) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/transaksi/by-penitip:", error);
    return NextResponse.json(
      { error: "Failed to fetch Penitip's Transaksi" },
      { status: 500 }
    );
  }
}
