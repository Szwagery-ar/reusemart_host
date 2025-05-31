import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");
        const id_pembeli = searchParams.get("id_pembeli");
        const jenis_pengiriman = searchParams.get("jenis_pengiriman"); // 'SELF_PICKUP' atau 'COURIER'

        let query = `
      SELECT 
        t.id_transaksi, 
        t.no_nota, 
        t.harga_awal, 
        t.ongkos_kirim, 
        t.diskon, 
        t.harga_akhir, 
        t.status_transaksi, 
        t.tanggal_pesan, 
        t.tanggal_lunas, 
        p.nama,
        pg.jenis_pengiriman
      FROM transaksi t
      JOIN pembeli p ON t.id_pembeli = p.id_pembeli
      LEFT JOIN pengiriman pg ON t.id_transaksi = pg.id_transaksi
    `;

        let conditions = [];
        let values = [];

        if (id_pembeli) {
            conditions.push("t.id_pembeli = ?");
            values.push(id_pembeli);
        }

        if (search) {
            conditions.push("(t.no_nota LIKE ? OR p.nama LIKE ?)");
            values.push(`%${search}%`, `%${search}%`);
        }

        if (jenis_pengiriman) {
            conditions.push("pg.jenis_pengiriman = ?");
            values.push(jenis_pengiriman.toLowerCase());
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // Urutkan: yang status_transaksi 'PENDING' muncul paling atas
        query += `
      ORDER BY 
        CASE WHEN t.status_transaksi = 'PENDING' THEN 0 ELSE 1 END,
        t.tanggal_pesan DESC
    `;

        const [transaksi] = await pool.query(query, values);

        return NextResponse.json({ transaksi }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch Transaksi:", error);
        return NextResponse.json({ error: "Failed to fetch Transaksi" }, { status: 500 });
    }
}



export async function POST(request) {
    try {
        const { id_pembeli } = await request.json();

        if (!id_pembeli) {
            return NextResponse.json({ error: "id_pembeli is required!" }, { status: 400 });
        }

        // Ambil barang yang akan di-checkout
        const [barangCheckout] = await pool.query(`
            SELECT b.id_barang, b.harga_barang
            FROM bridgebarangcart bc
            JOIN cart c ON bc.id_cart = c.id_cart
            JOIN barang b ON bc.id_barang = b.id_barang
            WHERE c.id_pembeli = ? AND bc.is_checkout = 1
        `, [id_pembeli]);

        if (!barangCheckout || barangCheckout.length === 0) {
            return NextResponse.json({ error: "Tidak ada barang yang dipilih untuk checkout!" }, { status: 400 });
        }

        // Hitung harga_awal dari total barang yang dicheckout
        const harga_awal = barangCheckout.reduce((total, item) => total + parseFloat(item.harga_barang), 0);

        // Ongkos kirim default ke 0 (nanti diupdate saat pengiriman dibuat)
        const ongkos_kirim = 0;

        // Ambil poin loyalitas
        const [pembeli] = await pool.query(`
            SELECT poin_loyalitas FROM pembeli WHERE id_pembeli = ?
        `, [id_pembeli]);

        if (!pembeli || pembeli.length === 0) {
            return NextResponse.json({ error: "Pembeli tidak ditemukan!" }, { status: 404 });
        }

        const diskon = Math.floor(pembeli[0].poin_loyalitas / 100) * 10000;
        const harga_akhir = (harga_awal + ongkos_kirim - diskon).toFixed(2);

        // Buat nomor nota
        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const [lastTransaksi] = await pool.query("SELECT MAX(id_transaksi) AS last_id FROM transaksi");
        const id_transaksi = (lastTransaksi[0].last_id || 0) + 1;
        const no_nota = `${year}.${month}.${id_transaksi}`;

        // Insert transaksi
        await pool.query(`
            INSERT INTO transaksi (id_transaksi, id_pembeli, status_transaksi, no_nota, harga_awal, ongkos_kirim, diskon, harga_akhir, tanggal_pesan, tanggal_lunas)
            VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, NOW(), NULL)
        `, [id_transaksi, id_pembeli, no_nota, harga_awal, ongkos_kirim, diskon, harga_akhir]);

        // Update barang yang di-checkout: assign ke transaksi & ubah status_titip
        for (const item of barangCheckout) {
            await pool.query(`
                UPDATE barang
                SET id_transaksi = ?, status_titip = 'HOLD'
                WHERE id_barang = ?
            `, [id_transaksi, item.id_barang]);
        }

        return NextResponse.json({ message: "Transaksi berhasil dibuat!", id_transaksi }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message || "Gagal membuat transaksi." }, { status: 500 });
    }
}




export async function PUT(request) {
    try {
        const { id_transaksi, status_transaksi, no_nota, harga_awal, ongkos_kirim, diskon, harga_akhir } = await request.json();

        if (!id_transaksi || !status_transaksi || !no_nota || !harga_awal || !ongkos_kirim || !diskon || !harga_akhir) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [transaksiExists] = await pool.query("SELECT * FROM transaksi WHERE id_transaksi = ?", [id_transaksi]);

        if (transaksiExists.length === 0) {
            return NextResponse.json({ error: "Transaksi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE transaksi SET status_transaksi = ?, no_nota = ?, harga_awal = ?, ongkos_kirim = ?, diskon = ?, harga_akhir = ? WHERE id_transaksi = ?",
            [status_transaksi, no_nota, harga_awal, ongkos_kirim, diskon, harga_akhir, id_transaksi]
        );

        return NextResponse.json({ message: "Transaksi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Transaksi" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_transaksi } = await request.json();

        if (!id_transaksi) {
            return NextResponse.json({ error: "id_transaksi is required!" }, { status: 400 });
        }

        const [transaksiExists] = await pool.query("SELECT * FROM transaksi WHERE id_transaksi = ?", [id_transaksi]);

        if (transaksiExists.length === 0) {
            return NextResponse.json({ error: "Transaksi not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM transaksi WHERE id_transaksi = ?", [id_transaksi]);

        return NextResponse.json({ message: "Transaksi deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Transaksi" }, { status: 500 });
    }
}
