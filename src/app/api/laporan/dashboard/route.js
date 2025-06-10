import { NextResponse } from "next/server";
import pool from "@/lib/db";

const enToIdBulan = {
    January: "Januari", February: "Februari", March: "Maret", April: "April",
    May: "Mei", June: "Juni", July: "Juli", August: "Agustus",
    September: "September", October: "Oktober", November: "November", December: "Desember"
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tahun = searchParams.get('tahun') || new Date().getFullYear();

        // 1. Penjualan Bulanan
        const [penjualanRows] = await pool.query(`
            SELECT 
                MONTHNAME(t.tanggal_lunas) AS bulan,
                COUNT(bt.id_barang) AS jumlah_terjual,
                SUM(DISTINCT t.harga_akhir) AS jumlah_penjualan
            FROM transaksi t
            JOIN bridgebarangtransaksi bt ON t.id_transaksi = bt.id_transaksi
            WHERE t.status_transaksi = 'DONE' AND YEAR(t.tanggal_lunas) = ?
            GROUP BY MONTH(t.tanggal_lunas)
            ORDER BY MONTH(t.tanggal_lunas)
        `, [tahun]);

        const penjualan = penjualanRows.map(row => ({
            name: row.bulan,
            value: row.jumlah_penjualan
        }));

        const penjualanTable = penjualanRows.map(row => [
            enToIdBulan[row.bulan] || row.bulan,
            Number(row.jumlah_terjual),
            Number(row.jumlah_penjualan)
        ]);

        // 2. Komisi Produk (filtered by tahun)
        const [komisiRows] = await pool.query(`
            SELECT 
                b.kode_produk,
                b.nama_barang,
                b.harga_barang AS harga_jual,
                pb.tanggal_masuk,
                t.tanggal_lunas AS tanggal_laku,
                k.komisi_hunter,
                k.komisi_reusemart,
                k.komisi_penitip AS bonus_penitip,
                (k.komisi_hunter + k.komisi_reusemart + k.komisi_penitip) AS total_komisi
            FROM komisi k
            JOIN transaksi t ON k.id_transaksi = t.id_transaksi
            JOIN bridgebarangtransaksi bt ON t.id_transaksi = bt.id_transaksi
            JOIN barang b ON bt.id_barang = b.id_barang
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            WHERE b.status_titip = 'SOLD' AND YEAR(t.tanggal_lunas) = ?
        `, [tahun]);

        const komisi = komisiRows.map(row => ({
            name: row.nama_barang,
            value: parseFloat(row.total_komisi),
        }));

        const komisiTable = komisiRows.map(row => [
            row.kode_produk,
            row.nama_barang,
            parseFloat(row.harga_jual),
        ]);

        const komisiFullTable = komisiRows.map(row => ({
            kode_produk: row.kode_produk,
            nama_barang: row.nama_barang,
            harga_jual: parseFloat(row.harga_jual),
            tanggal_masuk: row.tanggal_masuk,
            tanggal_laku: row.tanggal_laku,
            komisi_hunter: parseFloat(row.komisi_hunter),
            komisi_reusemart: parseFloat(row.komisi_reusemart),
            bonus_penitip: parseFloat(row.bonus_penitip),
        }));

        // 3. Stok Gudang (no filter)
        const [stokRows] = await pool.query(`
            SELECT 
                b.kode_produk,
                b.nama_barang,
                b.harga_barang,
                b.status_titip,
                b.is_extended,
                pb.id_penitip,
                p.id,
                p.nama AS nama_penitip,
                pb.tanggal_masuk,
                b.id_petugas_hunter,
                h.nama AS nama_hunter,
                MIN(k.nama_kategori) AS nama_kategori
            FROM barang b
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            JOIN penitip p ON pb.id_penitip = p.id_penitip
            LEFT JOIN pegawai h ON b.id_petugas_hunter = h.id_pegawai
            JOIN bridgekategoribarang bk ON b.id_barang = bk.id_barang
            JOIN kategoribarang k ON bk.id_kategori = k.id_kategori
            WHERE b.status_titip IN ('AVAILABLE', 'EXTENDED', 'EXPIRED') AND YEAR(b.tanggal_masuk) = ?
            GROUP BY b.id_barang
        `, [tahun]);

        const stokTable = stokRows.map(row => [row.nama_barang, row.nama_kategori]);

        const stokFullTable = stokRows.map(row => ({
            kode_produk: row.kode_produk,
            nama_barang: row.nama_barang,
            id: row.id,
            nama_penitip: row.nama_penitip,
            tanggal_masuk: row.tanggal_masuk,
            perpanjangan: row.is_extended == null ? "-" : row.is_extended ? "Ya" : "Tidak",
            id_hunter: row.id_petugas_hunter,
            nama_hunter: row.nama_hunter || "-",
            harga_barang: row.harga_barang,
        }));

        // 4. Penjualan per Kategori (filtered by tahun)
        const [kategoriRows] = await pool.query(`
            SELECT 
                k.nama_kategori AS kategori,
                SUM(CASE WHEN t.status_transaksi = 'DONE' AND YEAR(t.tanggal_lunas) = ? THEN 1 ELSE 0 END) AS jumlah_terjual,
                SUM(CASE WHEN t.status_transaksi = 'CANCELLED' AND YEAR(t.tanggal_lunas) = ? THEN 1 ELSE 0 END) AS jumlah_gagal
            FROM kategoribarang k
            LEFT JOIN bridgekategoribarang bk ON k.id_kategori = bk.id_kategori
            LEFT JOIN barang b ON bk.id_barang = b.id_barang
            LEFT JOIN bridgebarangtransaksi bt ON b.id_barang = bt.id_barang
            LEFT JOIN transaksi t ON bt.id_transaksi = t.id_transaksi
            GROUP BY k.id_kategori
        `, [tahun, tahun]);

        const kategori = kategoriRows.map(row => ({
            name: row.kategori,
            value: Number(row.jumlah_terjual) || 0
        }));

        const kategoriTable = kategoriRows.map(row => [
            row.kategori,
            row.jumlah_terjual || 0,
            row.jumlah_gagal || 0,
        ]);

        // 5. Barang Expired
        const [expiredRows] = await pool.query(`
            SELECT 
                b.kode_produk,
                b.nama_barang,
                p.id,
                p.nama AS nama_penitip,
                b.tanggal_masuk,
                b.tanggal_expire,
                DATE_ADD(b.tanggal_expire, INTERVAL 7 DAY) AS batas_ambil
            FROM barang b
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            JOIN penitip p ON pb.id_penitip = p.id_penitip
            WHERE b.status_titip = 'EXPIRED'
        `);

        const expiredTable = expiredRows.map(row => ({
            kode_produk: row.kode_produk,
            nama_barang: row.nama_barang
        }));

        const expiredPDFTable = expiredRows.map(row => [
            row.kode_produk,
            row.nama_barang,
            row.id,
            row.nama_penitip,
            new Date(row.tanggal_masuk).toLocaleDateString("id-ID"),
            new Date(row.tanggal_expire).toLocaleDateString("id-ID"),
            new Date(row.batas_ambil).toLocaleDateString("id-ID"),
        ]);

        // 6. Donasi Barang (filtered by tahun)
        const [donasiRows] = await pool.query(`
            SELECT 
                b.kode_produk,
                b.nama_barang,
                p.id_penitip,
                p.nama AS nama_penitip,
                d.tanggal_donasi,
                o.nama AS nama_organisasi,
                d.nama_penerima
            FROM barang b
            JOIN donasi d ON b.id_donasi = d.id_donasi
            JOIN penitipanbarang pb ON b.id_penitipan = pb.id_penitipan
            JOIN penitip p ON pb.id_penitip = p.id_penitip
            JOIN requestdonasi r ON d.id_request = r.id_request
            JOIN organisasi o ON r.id_organisasi = o.id_organisasi
            WHERE YEAR(d.tanggal_donasi) = ?
        `, [tahun]);

        const donasiTable = donasiRows.map(row => ({
            nama_organisasi: row.nama_organisasi,
            nama_barang: row.nama_barang,
        }));

        const donasiPDFTable = donasiRows.map(row => [
            row.kode_produk,
            row.nama_barang,
            row.id_penitip,
            row.nama_penitip,
            new Date(row.tanggal_donasi).toLocaleDateString("id-ID"),
            row.nama_organisasi,
            row.nama_penerima
        ]);

        // 7. Request Donasi (tidak perlu filter tahun)
        const [reqRows] = await pool.query(`
            SELECT 
                o.id,
                o.nama AS nama_organisasi,
                o.alamat,
                r.deskripsi,
                r.status_request
            FROM requestdonasi r
            JOIN organisasi o ON r.id_organisasi = o.id_organisasi
            WHERE r.status_request = 'PENDING'
        `);

        const reqdonasi = reqRows.map(row => ({
            nama_organisasi: row.nama_organisasi,
            deskripsi: row.deskripsi,
        }));

        const reqdonasiPDFTable = reqRows.map(row => [
            row.id,
            row.nama_organisasi,
            row.alamat,
            row.deskripsi,
        ]);

        // 8. Transaksi Penitip (semua data)
        const [transaksiRows] = await pool.query(`
            SELECT 
                pb.no_nota,
                pb.id_penitip,
                p.nama AS nama_penitip,
                pb.tanggal_masuk
            FROM penitipanbarang pb
            JOIN penitip p ON pb.id_penitip = p.id_penitip
        `);

        return NextResponse.json({
            success: true,
            penjualan,
            penjualanTable,
            komisi,
            komisiTable,
            komisiFullTable,
            stokTable,
            stokFullTable,
            kategori,
            kategoriTable,
            expiredTable,
            expiredPDFTable,
            donasiTable,
            donasiPDFTable,
            reqdonasi,
            reqdonasiPDFTable,
            transaksipenitip: transaksiRows
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
