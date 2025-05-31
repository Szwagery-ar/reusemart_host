import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  const { id_bridge_barang } = await request.json();

  if (!id_bridge_barang || !Array.isArray(id_bridge_barang)) {
    return NextResponse.json({ error: "ID barang tidak valid" }, { status: 400 });
  }

  await Promise.all(id_bridge_barang.map(id =>
    pool.query(`UPDATE bridgebarangcart SET is_checkout = 1 WHERE id_bridge_barang = ?`, [id])
  ));

  return NextResponse.json({ message: "Barang berhasil ditandai untuk checkout." }, { status: 200 });
}
