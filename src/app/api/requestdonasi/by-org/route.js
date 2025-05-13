import pool from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_org = decoded.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
      SELECT 
        rq.id_request, 
        rq.tanggal_request, 
        rq.deskripsi, 
        rq.status_request
      FROM requestdonasi rq
      JOIN organisasi o ON rq.id_organisasi = o.id_organisasi
      WHERE rq.id_organisasi = ?
    `;
    let values = [id_org];

    if (search) {
      query += ` AND (rq.deskripsi LIKE ? OR rq.status_request LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY rq.tanggal_request DESC`;

    const [rows] = await pool.query(query, values);

    return NextResponse.json({ request: rows }, { status: 200 });

  } catch (error) {
    console.error("GET /requestdonasi/by-org error:", error);
    return NextResponse.json({ error: "Failed to fetch RequestDonasi" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_org = decoded.id;

    const { deskripsi } = await request.json();

    if (!deskripsi || deskripsi.trim() === "") {
      return NextResponse.json({ error: "Deskripsi tidak boleh kosong" }, { status: 400 });
    }

    const today = new Date();
    const tanggal_request = today.toISOString().split("T")[0]; // YYYY-MM-DD

    await pool.query(`
            INSERT INTO requestdonasi (id_organisasi, tanggal_request, deskripsi, status_request)
            VALUES (?, ?, ?, ?)
        `, [id_org, tanggal_request, deskripsi, "PENDING"]);

    return NextResponse.json({ message: "Request berhasil ditambahkan" }, { status: 201 });

  } catch (error) {
    console.error("Error adding request:", error);
    return NextResponse.json({ error: "Gagal menambahkan request" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const id_org = decoded.id;

    const { id_request, deskripsi } = await request.json();

    if (!id_request || !deskripsi || deskripsi.trim() === "") {
      return NextResponse.json({ error: "ID dan deskripsi harus diisi" }, { status: 400 });
    }

    const [existingRequest] = await pool.query(
      "SELECT * FROM requestdonasi WHERE id_request = ? AND id_organisasi = ?",
      [id_request, id_org]
    );

    if (existingRequest.length === 0) {
      return NextResponse.json({ error: "Request Donasi tidak ditemukan!" }, { status: 404 });
    }

    if (["APPROVED", "DONE", "CANCELLED"].includes(existingRequest[0].status_request)) {
      return NextResponse.json({ error: "Request tidak dapat diedit karena sudah diproses." }, { status: 403 });
    }

    await pool.query(
      "UPDATE requestdonasi SET deskripsi = ? WHERE id_request = ?",
      [deskripsi, id_request]
    );

    return NextResponse.json({ message: "Request berhasil diperbarui!" }, { status: 200 });

  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: "Gagal memperbarui request" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id_request } = await request.json();

    if (!id_request) {
      return NextResponse.json({ error: "id_request is required!" }, { status: 400 });
    }

    const [existingRequest] = await pool.query("SELECT * FROM requestdonasi WHERE id_request = ?", [id_request]);

    if (existingRequest.length === 0) {
      return NextResponse.json({ error: "Request Donasi not found!" }, { status: 404 });
    }

    if (["APPROVED", "DONE"].includes(existingRequest[0].status_request)) {
      return NextResponse.json({ error: "Request tidak dapat dihapus karena sudah diproses." }, { status: 403 });
    }

    await pool.query("DELETE FROM requestdonasi WHERE id_request = ?", [id_request]);

    return NextResponse.json({ message: "Request Donasi deleted successfully!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete Request Donasi" }, { status: 500 });
  }
}