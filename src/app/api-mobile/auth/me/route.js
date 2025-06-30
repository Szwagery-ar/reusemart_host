import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 200 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, role } = decoded;

    let userData = null;

    if (role === "penitip") {
      const [rows] = await pool.query(
        `SELECT id_penitip AS id, nama, email, no_ktp, no_telepon, src_img_profile, jml_barang_terjual, badge_level, komisi, poin_reward
        FROM penitip 
        WHERE id_penitip = ?
        `,
        [id]
      );
      userData = rows[0];
    } else if (role === "pembeli") {
      const [rows] = await pool.query(
        `
        SELECT id_pembeli, nama, email, no_telepon, poin_loyalitas, src_img_profile
        FROM pembeli 
        WHERE id_pembeli = ?
      `,
        [id]
      );
      userData = rows[0];
    } else if (role === "kurir" || role === "hunter") {
      const [rows] = await pool.query(
        `
        SELECT 
          p.id_pegawai, 
          id,
          p.nama,
          p.no_telepon,
          p.email,
          p.tanggal_lahir,
          p.komisi,
          p.src_img_profile,
          j.nama_jabatan
        FROM pegawai p
        LEFT JOIN jabatan j ON p.id_jabatan = j.id_jabatan
        WHERE p.id_pegawai = ?
        `,
        [id]
      );
      if (rows.length > 0) {
        userData = {
          ...rows[0],
          role: rows[0].nama_jabatan?.toLowerCase() || "pegawai",
        };
      }
    }

    if (!userData) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, isAuthenticated: true, user: userData }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid token" }),
      { status: 401 }
    );
  }
}
