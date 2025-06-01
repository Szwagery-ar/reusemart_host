import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req) {
  console.log("📥 Endpoint push-token terpanggil!");

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Token tidak ditemukan" }), {
      status: 401,
    });
  }

  let userId, userRole;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    userRole = decoded.role; 
    if (userRole === "kurir" || userRole === "hunter") {
      userRole = "pegawai";
    }
    console.log("✅ User login:", { userId, userRole });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Token tidak valid" }), {
      status: 401,
    });
  }

  const { expo_push_token } = await req.json();

  if (!expo_push_token) {
    return new Response(JSON.stringify({ error: "Token push kosong" }), {
      status: 400,
    });
  }

  try {
    // 1. Hapus push token lama dari semua entitas lain
    const tables = ["penitip", "pembeli", "pegawai"];
    for (const table of tables) {
      let condition = "";
      if (table === userRole) {
        // Jangan hapus dari user yang sedang login
        condition = `AND id_${table} != ?`;
      }

      await pool.query(
        `UPDATE ${table} SET expo_push_token = NULL WHERE expo_push_token = ? ${condition}`,
        condition ? [expo_push_token, userId] : [expo_push_token]
      );
    }

    // 2. Simpan token baru di user login sekarang
    await pool.query(
      `UPDATE ${userRole} SET expo_push_token = ? WHERE id_${userRole} = ?`,
      [expo_push_token, userId]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error saat simpan token:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}