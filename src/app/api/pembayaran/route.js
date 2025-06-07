import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
            SELECT p.id_pembayaran, p.status_pembayaran, p.img_bukti_transfer, t.no_nota, peg.nama AS petugas_name
            FROM pembayaran p
            JOIN transaksi t ON p.id_transaksi = t.id_transaksi
            LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
        `;
    let values = [];

    if (search) {
      query += ` WHERE t.no_nota LIKE ? OR peg.nama LIKE ?`;
      values = [`%${search}%`, `%${search}%`];
    }

    const [pembayaran] = await pool.query(query, values);

    return NextResponse.json({ pembayaran }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Pembayaran" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      id_transaksi,
      img_bukti_transfer,
      jenis_pengiriman,
      ongkos_kirim,
      id_alamat,
    } = await request.json();

    if (!id_transaksi || !img_bukti_transfer || !jenis_pengiriman) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const [tx] = await pool.query(
      `SELECT * FROM transaksi WHERE id_transaksi = ?`,
      [id_transaksi]
    );
    if (tx.length === 0) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    let lokasi = null;
    if (jenis_pengiriman === "COURIER") {
      if (!id_alamat) {
        return NextResponse.json(
          { error: "Alamat wajib diisi untuk pengiriman kurir." },
          { status: 400 }
        );
      }

      const [alamatRows] = await pool.query(
        `SELECT lokasi FROM alamat WHERE id_alamat = ?`,
        [id_alamat]
      );

      if (alamatRows.length === 0) {
        return NextResponse.json(
          { error: "Alamat tidak ditemukan." },
          { status: 404 }
        );
      }

      lokasi = alamatRows[0].lokasi;
    }

    const deadline = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      `INSERT INTO pembayaran (id_transaksi, status_pembayaran, img_bukti_transfer, deadline)
             VALUES (?, 'PENDING', ?, ?)`,
      [id_transaksi, img_bukti_transfer, deadline]
    );

    await pool.query(
      `UPDATE transaksi SET ongkos_kirim = ?, 
                harga_akhir = harga_awal - diskon + ? 
                WHERE id_transaksi = ?`,
      [ongkos_kirim, ongkos_kirim, id_transaksi]
    );

    await pool.query(
      `INSERT INTO pengiriman (
                id_transaksi, jenis_pengiriman, id_alamat, lokasi, status_pengiriman
             ) VALUES (?, ?, ?, ?, 'IN_PROGRESS')`,
      [
        id_transaksi,
        jenis_pengiriman,
        jenis_pengiriman === "COURIER" ? id_alamat : null,
        lokasi,
      ]
    );

    return NextResponse.json(
      {
        message: "Pembayaran berhasil dan data pengiriman disimpan.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/pembayaran error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembayaran." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id_pembayaran, id_petugas_cs, status_pembayaran } =
      await request.json();

    if (!id_pembayaran || !id_petugas_cs || !status_pembayaran) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    const [paymentExists] = await pool.query(
      "SELECT id_transaksi FROM pembayaran WHERE id_pembayaran = ?",
      [id_pembayaran]
    );

    if (!paymentExists || paymentExists.length === 0) {
      return NextResponse.json(
        { error: "Payment ID not found!" },
        { status: 404 }
      );
    }

    const id_transaksi = paymentExists[0].id_transaksi;

    let tanggal_lunas = null;

    if (status_pembayaran === "CONFIRMED") {
      tanggal_lunas = new Date().toISOString();

      const [transaksiResult] = await pool.query(
        `SELECT harga_awal, diskon, id_pembeli FROM transaksi WHERE id_transaksi = ?`,
        [id_transaksi]
      );

      if (!transaksiResult || transaksiResult.length === 0) {
        return NextResponse.json(
          { error: "Transaction not found!" },
          { status: 404 }
        );
      }

      const { harga_awal, diskon, id_pembeli } = transaksiResult[0];
      const total_belanja = harga_awal - diskon;

      let poin = Math.floor(total_belanja / 10000);

      if (total_belanja > 500000) {
        poin += Math.floor(poin * 0.2);
      }

      await pool.query(
        "UPDATE transaksi SET tanggal_lunas = ?, status_transaksi = 'PAID', tambahan_poin = ? WHERE id_transaksi = ?",
        [tanggal_lunas, poin, id_transaksi]
      );

      await pool.query(
        "UPDATE pembeli SET poin_loyalitas = poin_loyalitas + ? WHERE id_pembeli = ?",
        [poin, id_pembeli]
      );
    }

    if (status_pembayaran === "FAILED") {
      await pool.query(
        "UPDATE transaksi SET status_transaksi = 'CANCELLED' WHERE id_transaksi = ?",
        [id_transaksi]
      );

      await pool.query(
        "UPDATE pengiriman SET status_pengiriman = 'FAILED' WHERE id_transaksi = ?",
        [id_transaksi]
      );

      await pool.query(
        `
                UPDATE barang 
                SET status_titip = 'AVAILABLE',
                id_transaksi = NULL
                WHERE id_barang IN (
                    SELECT id_barang FROM bridgebarangcart 
                    WHERE id_cart IN (
                        SELECT id_cart FROM cart WHERE id_transaksi = ?
                    )
                )
            `,
        [id_transaksi]
      );
    }

    await pool.query(
      "UPDATE pembayaran SET status_pembayaran = ?, id_petugas_cs = ? WHERE id_pembayaran = ?",
      [status_pembayaran, id_petugas_cs, id_pembayaran]
    );

    return NextResponse.json(
      { message: "Pembayaran updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Pembayaran" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_pembayaran } = await request.json();

    if (!id_pembayaran) {
      return NextResponse.json(
        { error: "id_pembayaran is required!" },
        { status: 400 }
      );
    }

    const [pembayaranExists] = await pool.query(
      "SELECT * FROM pembayaran WHERE id_pembayaran = ?",
      [id_pembayaran]
    );

    if (pembayaranExists.length === 0) {
      return NextResponse.json(
        { error: "Pembayaran not found!" },
        { status: 404 }
      );
    }

    await pool.query("DELETE FROM pembayaran WHERE id_pembayaran = ?", [
      id_pembayaran,
    ]);

    return NextResponse.json(
      { message: "Pembayaran deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete Pembayaran" },
      { status: 500 }
    );
  }
}
