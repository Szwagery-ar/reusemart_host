import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request, context) {
  const { id } = context.params;
  const id_merchandise = id;

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_pembeli = decoded.id;

    const [pembeliRows] = await pool.query(
      "SELECT * FROM pembeli WHERE id_pembeli = ?",
      [id_pembeli]
    );
    const pembeli = pembeliRows[0];

    const [merchRows] = await pool.query(
      "SELECT jumlah_poin, jumlah_stok FROM merchandise WHERE id_merchandise = ?",
      [id_merchandise]
    );
    const merch = merchRows[0];

    if (!pembeli || !merch) {
      return new Response(
        JSON.stringify({ success: false, message: "Data tidak ditemukan" }),
        { status: 404 }
      );
    }

    if (pembeli.poin_loyalitas < merch.jumlah_poin || merch.jumlah_stok < 1) {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const jumlah = 1;
    const total_poin = merch.jumlah_poin;

    await pool.query(
      "INSERT INTO klaim (id_pembeli, id_merchandise, jml_merch_diklaim, total_poin, tanggal_klaim) VALUES (?, ?, ?, ?, NOW())",
      [id_pembeli, id_merchandise, jumlah, total_poin]
    );

    await pool.query(
      "UPDATE pembeli SET poin_loyalitas = poin_loyalitas - ? WHERE id_pembeli = ?",
      [merch.jumlah_poin, id_pembeli]
    );

    await pool.query(
      "UPDATE merchandise SET jumlah_stok = jumlah_stok - 1 WHERE id_merchandise = ?",
      [id_merchandise]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gagal melakukan klaim:", error);
    return new Response(
      JSON.stringify({ error: "Gagal melakukan klaim" }),
      { status: 500 }
    );
  }
}

