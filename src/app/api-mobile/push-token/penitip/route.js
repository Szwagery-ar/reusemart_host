import pool from "@/lib/db";
import jwt from "jsonwebtoken"; 

export async function GET(req) {
  console.log("📥 Endpoint GET push-token/penitip terpanggil!");

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Token tidak ditemukan" }), {
      status: 401,
    });
  }

  let id_penitip;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_penitip = decoded.id;
    console.log("✅ ID Penitip dari token:", id_penitip);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Token tidak valid" }), {
      status: 401,
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT expo_push_token FROM penitip WHERE id_penitip = ?",
      [id_penitip]
    );

    if (rows.length === 0 || !rows[0].expo_push_token) {
      return new Response(JSON.stringify({ error: "Token tidak ditemukan di database" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ expo_push_token: rows[0].expo_push_token }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  console.log("📥 Endpoint push-token/penitip terpanggil!");

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Token tidak ditemukan" }), {
      status: 401,
    });
  }

  let id_penitip;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    id_penitip = decoded.id; 
    console.log("✅ ID Penitip dari token:", id_penitip);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Token tidak valid" }), {
      status: 401,
    });
  }

  const { expo_push_token } = await req.json();

  try {
    await pool.query(
      "UPDATE penitip SET expo_push_token = ? WHERE id_penitip = ?",
      [expo_push_token, id_penitip]
    );
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}