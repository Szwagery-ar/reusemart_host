import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
            SELECT 
                k.id_komisi,
                t.no_nota,
                t.harga_awal - IFNULL(t.diskon, 0) AS harga_jual,
                k.komisi_reusemart,
                p.nama AS nama_penitip,
                k.komisi_penitip,
                h.nama AS nama_hunter,
                k.komisi_hunter
            FROM komisi k
            JOIN transaksi t ON k.id_transaksi = t.id_transaksi
            JOIN penitip p ON k.id_penitip = p.id_penitip
            LEFT JOIN pegawai h ON k.id_petugas_hunter = h.id_pegawai
        `;

    const values = [];

    if (search) {
      query += `
                WHERE 
                    t.no_nota LIKE ? 
                    OR p.nama LIKE ? 
                    OR h.nama LIKE ?
            `;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [komisi] = await pool.query(query, values);

    return NextResponse.json({ komisi }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch Komisi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { id_transaksi } = await request.json();

    if (!id_transaksi) {
      return NextResponse.json(
        { error: "id_transaksi is required!" },
        { status: 400 }
      );
    }

    // Cek status transaksi
    const [transaksiResult] = await pool.query(
      "SELECT status_transaksi FROM transaksi WHERE id_transaksi = ?",
      [id_transaksi]
    );

    if (!transaksiResult.length) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan!" },
        { status: 404 }
      );
    }

    const status_transaksi = transaksiResult[0].status_transaksi;
    if (!["PAID", "DONE"].includes(status_transaksi)) {
      return NextResponse.json(
        {
          error:
            "Komisi hanya bisa dihitung jika status transaksi sudah PAID atau DONE.",
        },
        { status: 400 }
      );
    }

    // Ambil semua barang terkait transaksi
    const [barangList] = await pool.query(
      `
      SELECT 
        b.id_barang,
        b.id_penitip,
        b.id_petugas_hunter,
        b.harga_barang,
        b.tanggal_masuk,
        b.status_titip,
        b.is_extended
      FROM bridgebarangtransaksi bt
      JOIN barang b ON bt.id_barang = b.id_barang
      WHERE bt.id_transaksi = ?
      `,
      [id_transaksi]
    );

    for (const barang of barangList) {
      const {
        id_penitip,
        id_petugas_hunter,
        harga_barang,
        tanggal_masuk,
        status_titip,
        is_extended,
      } = barang;

      const masuk = new Date(tanggal_masuk);
      const today = new Date();
      const diffInDays = Math.floor((today - masuk) / (1000 * 60 * 60 * 24));

      // Cek apakah status titip EXTENDED
      const isExtended = status_titip === "EXTENDED" || is_extended;

      // Persentase dasar
      let persentase_reusemart = isExtended ? 0.3 : 0.2;
      let persentase_penitip = 1 - persentase_reusemart;
      let persentase_hunter = 0;

      let komisi_hunter = 0;

      if (id_petugas_hunter) {
        persentase_hunter = 0.05;
        komisi_hunter = harga_barang * persentase_hunter;
        persentase_reusemart -= persentase_hunter;
      }

      let komisi_reusemart = harga_barang * persentase_reusemart;
      let komisi_penitip = harga_barang * persentase_penitip;

      // Bonus penitip jika laku < 7 hari
      if (diffInDays < 7) {
        const bonus = komisi_reusemart * 0.1;
        komisi_penitip += bonus;
        komisi_reusemart -= bonus;
      }

      // Simpan ke tabel komisi
      if (id_petugas_hunter) {
        await pool.query(
          `
          INSERT INTO komisi (
            id_transaksi, id_penitip, id_petugas_hunter,
            komisi_penitip, komisi_reusemart, komisi_hunter
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            id_transaksi,
            id_penitip,
            id_petugas_hunter,
            komisi_penitip,
            komisi_reusemart,
            komisi_hunter,
          ]
        );

        // Tambahkan komisi ke saldo kurir
        await pool.query(
          `UPDATE pegawai SET komisi = komisi + ? WHERE id_pegawai = ?`,
          [komisi_hunter, id_petugas_hunter]
        );
      } else {
        await pool.query(
          `
          INSERT INTO komisi (
            id_transaksi, id_penitip, komisi_penitip, komisi_reusemart
          ) VALUES (?, ?, ?, ?)
        `,
          [id_transaksi, id_penitip, komisi_penitip, komisi_reusemart]
        );
      }

      // Tambahkan komisi ke saldo penitip
      await pool.query(
        `UPDATE penitip SET komisi = komisi + ? WHERE id_penitip = ?`,
        [komisi_penitip, id_penitip]
      );
    }

    return NextResponse.json(
      {
        message:
          "Komisi berhasil dihitung, disimpan, dan ditambahkan ke saldo.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/komisi error:", error);
    return NextResponse.json(
      { error: "Gagal menghitung komisi." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      id_komisi,
      id_transaksi,
      id_penitip,
      id_petugas_hunter,
      komisi_penitip,
      komisi_reusemart,
      komisi_hunter,
    } = await request.json();

    if (
      !id_komisi ||
      !id_transaksi ||
      !id_penitip ||
      !id_petugas_hunter ||
      !komisi_penitip ||
      !komisi_reusemart ||
      !komisi_hunter
    ) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    const [komisiExists] = await pool.query(
      "SELECT * FROM komisi WHERE id_komisi = ?",
      [id_komisi]
    );

    if (komisiExists.length === 0) {
      return NextResponse.json({ error: "Komisi not found!" }, { status: 404 });
    }

    await pool.query(
      "UPDATE komisi SET id_transaksi = ?, id_penitip = ?, id_petugas_hunter = ?, komisi_penitip = ?, komisi_reusemart = ?, komisi_hunter = ? WHERE id_komisi = ?",
      [
        id_transaksi,
        id_penitip,
        id_petugas_hunter,
        komisi_penitip,
        komisi_reusemart,
        komisi_hunter,
        id_komisi,
      ]
    );

    return NextResponse.json(
      { message: "Komisi updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update Komisi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_komisi } = await request.json();

    if (!id_komisi) {
      return NextResponse.json(
        { error: "id_komisi is required!" },
        { status: 400 }
      );
    }

    const [komisiExists] = await pool.query(
      "SELECT * FROM komisi WHERE id_komisi = ?",
      [id_komisi]
    );

    if (komisiExists.length === 0) {
      return NextResponse.json({ error: "Komisi not found!" }, { status: 404 });
    }

    await pool.query("DELETE FROM komisi WHERE id_komisi = ?", [id_komisi]);

    return NextResponse.json(
      { message: "Komisi deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete Komisi" },
      { status: 500 }
    );
  }
}
