import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(request, { params }) {
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
    const id_transaksi = parseInt(params.id);

    const [barangs] = await pool.query(
      `SELECT id_barang FROM bridgebarangtransaksi WHERE id_transaksi = ?`,
      [id_transaksi]
    );

    if (barangs.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada barang dalam transaksi." },
        { status: 404 }
      );
    }

    const barangIds = barangs.map((b) => b.id_barang);

    const [carts] = await pool.query(
      `SELECT id_cart FROM cart WHERE id_pembeli = ?`,
      [id_pembeli]
    );

    if (carts.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada cart ditemukan." },
        { status: 404 }
      );
    }

    const cartIds = carts.map((c) => c.id_cart);

    await pool.query(
      `UPDATE bridgebarangcart 
       SET is_checkout = 0
       WHERE id_barang IN (?) AND id_cart IN (?)`,
      [barangIds, cartIds]
    );

    for (const barang of barangs) {
      const status = barang.is_extended === 1 ? "EXTENDED" : "AVAILABLE";
      await pool.query(
        `UPDATE barang SET status_titip = ? WHERE id_barang = ?`,
        [status, barang.id_barang]
      );
    }

    return NextResponse.json({
      message: "Checkout dibatalkan dan status barang dikembalikan.",
    });
  } catch (err) {
    console.error("❌ Gagal reset checkout:", err);
    return NextResponse.json(
      { error: "Gagal membatalkan checkout." },
      { status: 500 }
    );
  }
}
