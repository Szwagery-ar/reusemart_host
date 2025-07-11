import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request) {
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
    const role = decoded.role;

    if (role !== "pembeli") {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized role" }),
        { status: 403 }
      );
    }

    // Ambil transaksi
    const [transaksiRows] = await pool.query(
      `SELECT 
          t.id_transaksi, t.no_nota, t.harga_awal, t.ongkos_kirim, t.diskon,
          t.harga_akhir, t.status_transaksi, t.tanggal_pesan, t.tanggal_lunas,
          t.tambahan_poin, p.status_pembayaran, p.img_bukti_transfer, t.is_rated,
          peg.nama AS petugas_name, peng.jenis_pengiriman, peng.tanggal_kirim,
          peng.tanggal_terima, peng.lokasi
      FROM transaksi t
      JOIN pembayaran p ON t.id_transaksi = p.id_transaksi
      LEFT JOIN pegawai peg ON p.id_petugas_cs = peg.id_pegawai
      LEFT JOIN pengiriman peng ON t.id_transaksi = peng.id_transaksi
      WHERE t.id_pembeli = ? AND t.status_transaksi != 'pending'
      ORDER BY t.tanggal_pesan DESC`,
      [id_pembeli]
    );

    // Ambil semua barang & gambar sekaligus
    const [barangRows] = await pool.query(
      `SELECT 
          bt.id_transaksi, b.id_barang, b.nama_barang, b.harga_barang,
          g.id_gambar, g.src_img
      FROM bridgebarangtransaksi bt
      JOIN barang b ON bt.id_barang = b.id_barang
      LEFT JOIN gambarbarang g ON g.id_barang = b.id_barang
      WHERE bt.id_transaksi IN (?)`,
      [transaksiRows.map((t) => t.id_transaksi)]
    );

    // Grouping barang per transaksi
    const transaksiWithBarang = transaksiRows.map((t) => {
      const barang = barangRows
        .filter((b) => b.id_transaksi === t.id_transaksi)
        .reduce((acc, curr) => {
          const existing = acc.find((b) => b.id_barang === curr.id_barang);
          if (existing) {
            if (curr.id_gambar) {
              existing.gambar_barang.push({
                id_gambar: curr.id_gambar,
                src_img: curr.src_img,
              });
            }
          } else {
            acc.push({
              id_barang: curr.id_barang,
              nama_barang: curr.nama_barang,
              harga_barang: curr.harga_barang,
              gambar_barang: curr.id_gambar
                ? [{ id_gambar: curr.id_gambar, src_img: curr.src_img }]
                : [],
            });
          }
          return acc;
        }, []);

      return {
        ...t,
        barang,
      };
    });

    return new Response(
      JSON.stringify({ success: true, transaksi: transaksiWithBarang }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Transaction GET error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
