import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
            SELECT pembeli.id_pembeli, pembeli.nama, pembeli.no_telepon, pembeli.email, pembeli.poin_loyalitas, 
                   alamat.nama_alamat, alamat.lokasi
            FROM pembeli
            LEFT JOIN alamat ON pembeli.id_pembeli = alamat.id_pembeli
            GROUP BY pembeli.id_pembeli, pembeli.nama, pembeli.no_telepon, pembeli.email, pembeli.poin_loyalitas
        `;

    let values = [];

    if (search) {
      query += `
                WHERE pembeli.nama LIKE ? 
                OR pembeli.email LIKE ? 
                OR pembeli.no_telepon LIKE ?
            `;
      values = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const [pembeli] = await pool.query(query, values);

    return NextResponse.json({ pembeli }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Pembeli" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nama, no_telepon, email, password } = await request.json();

    // Validasi input
    if (!nama || !no_telepon || !email || !password) {
      return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
    }

    // Validasi format email menggunakan regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format!" }, { status: 400 });
    }

    // Validasi password (minimal 8 karakter, mengandung angka, huruf besar, dan huruf kecil)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        error: "Password must be at least 8 characters long and include at least one number, one uppercase letter, and one lowercase letter."
      }, { status: 400 });
    }

    // Cek apakah email atau nomor telepon sudah ada di pembeli
    const [existingPembeli] = await pool.query("SELECT * FROM pembeli WHERE email = ? OR no_telepon = ?", [email, no_telepon]);
    if (existingPembeli.length > 0) {
      return NextResponse.json({ error: "Email or phone number already exists!" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Masukkan pembeli baru ke database
    await pool.query(
      "INSERT INTO pembeli (nama, no_telepon, email, password, poin_loyalitas) VALUES (?, ?, ?, ?, ?)",
      [nama, no_telepon, email, hashedPassword, 0]
    );

    // Return response sukses
    return NextResponse.json({ message: "Pembeli added successfully!" }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add Pembeli" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id_pembeli, nama, no_telepon, email } = await request.json();

    if (!id_pembeli || !nama || !no_telepon || !email) {
      return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
    }

    const [pembeliExists] = await pool.query("SELECT * FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

    if (pembeliExists.length === 0) {
      return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
    }

    await pool.query(
      "UPDATE pembeli SET nama = ?, no_telepon = ?, email = ? WHERE id_pembeli = ?",
      [nama, no_telepon, email, id_pembeli]
    );

    return NextResponse.json({ message: "Pembeli updated successfully!" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to update Pembeli" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id_pembeli } = await request.json();

    if (!id_pembeli) {
      return NextResponse.json({ error: "id_pembeli is required!" }, { status: 400 });
    }

    const [pembeliExists] = await pool.query("SELECT * FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

    if (pembeliExists.length === 0) {
      return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
    }

    await pool.query("DELETE FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

    return NextResponse.json({ message: "Pembeli deleted successfully!" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to delete Pembeli" }, { status: 500 });
  }
}
