import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  const id_penitip = params.id;

  try {
    const [rows] = await pool.query(
      `
        SELECT 
            b.id_barang,
            b.kode_produk,
            p.id_penitip,
            p.id AS id_penitip_internal,
            p.nama AS nama_penitip,
            MONTHNAME(t.tanggal_lunas) AS bulan,
            YEAR(t.tanggal_lunas) AS tahun,
            b.nama_barang,
            b.tanggal_masuk,
            t.tanggal_lunas AS tanggal_laku,
            t.harga_akhir,
            k.komisi_reusemart,
            k.komisi_penitip,
            k.komisi_hunter
        FROM barang b
        JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
        JOIN penitip p ON pb.id_penitip = p.id_penitip
        JOIN bridgebarangtransaksi bt ON b.id_barang = bt.id_barang
        JOIN transaksi t ON bt.id_transaksi = t.id_transaksi
        JOIN komisi k ON k.id_transaksi = t.id_transaksi AND k.id_penitip = p.id_penitip
        AND p.id_penitip = ?
        ORDER BY t.tanggal_lunas ASC
    `,
      [id_penitip]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        id_penitip,
        nama_penitip: "(Tidak ditemukan)",
        bulan: "-",
        tahun: "-",
        items: [],
      });
    }

    const { nama_penitip, bulan, tahun } = rows[0];

    const items = await Promise.all(
      rows.map(async (row) => {
        const barangQ = await pool.query(
          `SELECT harga_barang, id_petugas_hunter FROM barang WHERE id_barang = ?`,
          [row.id_barang]
        );
        const barangInfo = barangQ[0][0] || {};
        const harga_barang = barangInfo.harga_barang || 0;
        const adaHunter = !!barangInfo.id_petugas_hunter;

        const tglMasuk = new Date(row.tanggal_masuk);
        const tglLaku = new Date(row.tanggal_laku);
        const diffInDays = Math.floor(
          (tglLaku - tglMasuk) / (1000 * 60 * 60 * 24)
        );

        const isExtended = row.status_titip === "EXTENDED" || row.is_extended;

        // Persentase dasar
        let persentase_reusemart = isExtended ? 0.3 : 0.2;
        let persentase_penitip = 1 - persentase_reusemart;
        let persentase_hunter = adaHunter ? 0.05 : 0;

        if (adaHunter) persentase_reusemart -= persentase_hunter;

        // Komisi awal
        let komisi_hunter = harga_barang * persentase_hunter;
        let komisi_reusemart = harga_barang * persentase_reusemart;

        // Harga jual bersih = yang masuk ke penitip (tanpa bonus)
        const harga_jual_bersih =
          harga_barang - komisi_reusemart - komisi_hunter;

        // Bonus jika laku < 7 hari
        let bonus_terjual_cepat = 0;
        if (diffInDays < 7) {
          bonus_terjual_cepat = komisi_reusemart * 0.1;
          komisi_reusemart -= bonus_terjual_cepat;
        }

        // Pendapatan = bersih + bonus
        const pendapatan = harga_jual_bersih + bonus_terjual_cepat;

        return {
          id_barang: row.id_barang,
          kode_produk: row.kode_produk,
          nama_barang: row.nama_barang,
          tanggal_masuk: row.tanggal_masuk,
          tanggal_laku: row.tanggal_laku,
          harga_barang,
          harga_jual_bersih,
          bonus_terjual_cepat,
          pendapatan,
        };
      })
    );

    return NextResponse.json({
      success: true,
      id_penitip,
      nama_penitip,
      bulan,
      tahun,
      items,
    });
  } catch (error) {
    console.error("Error fetching transaksi penitip:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
