import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT 
                k.id_klaim, 
                k.id_merchandise, 
                m.nama_merch, 
                k.jml_merch_diklaim, 
                (m.jumlah_poin * k.jml_merch_diklaim) AS total_poin, 
                p.nama
            FROM klaim k
            JOIN merchandise m ON k.id_merchandise = m.id_merchandise
            JOIN pembeli p ON k.id_pembeli = p.id_pembeli
        `;
        let values = [];

        if (search) {
            query += ` WHERE p.nama LIKE ? OR m.nama_merch LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        }

        const [klaim] = await pool.query(query, values);

        return NextResponse.json({ klaim }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Klaim" }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        const { id_pembeli, id_merchandise, jml_merch_diklaim } = await request.json();

        if (!id_pembeli || !id_merchandise || !jml_merch_diklaim) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [pembeli] = await pool.query(
            "SELECT poin_loyalitas FROM pembeli WHERE id_pembeli = ?",
            [id_pembeli]
        );
        if (pembeli.length === 0) {
            return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
        }

        const [merch] = await pool.query(
            "SELECT jumlah_poin, jumlah_stok FROM merchandise WHERE id_merchandise = ?",
            [id_merchandise]
        );
        if (merch.length === 0) {
            return NextResponse.json({ error: "Merchandise not found!" }, { status: 404 });
        }

        const jumlahPoin = merch[0].jumlah_poin;
        const stokTersedia = merch[0].jumlah_stok;

        const total_poin = jumlahPoin * jml_merch_diklaim;

        if (pembeli[0].poin_loyalitas < total_poin) {
            return NextResponse.json({ error: "Not enough points to claim this merchandise!" }, { status: 400 });
        }

        if (stokTersedia < jml_merch_diklaim) {
            return NextResponse.json({ error: "Not enough stock to claim this merchandise!" }, { status: 400 });
        }

        await pool.query(
            "INSERT INTO klaim (id_pembeli, id_merchandise, jml_merch_diklaim, total_poin) VALUES (?, ?, ?, ?)",
            [id_pembeli, id_merchandise, jml_merch_diklaim, total_poin]
        );

        await pool.query(
            "UPDATE pembeli SET poin_loyalitas = poin_loyalitas - ? WHERE id_pembeli = ?",
            [total_poin, id_pembeli]
        );

        await pool.query(
            "UPDATE merchandise SET jumlah_stok = jumlah_stok - ? WHERE id_merchandise = ?",
            [jml_merch_diklaim, id_merchandise]
        );

        return NextResponse.json({ message: "Klaim created successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message || "Failed to create Klaim" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_klaim, id_pembeli, id_merchandise, jml_merch_diklaim, total_poin } = await request.json();

        if (!id_klaim || !id_pembeli || !id_merchandise || !jml_merch_diklaim || !total_poin) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [klaimExists] = await pool.query("SELECT * FROM klaim WHERE id_klaim = ?", [id_klaim]);

        if (klaimExists.length === 0) {
            return NextResponse.json({ error: "Klaim not found!" }, { status: 404 });
        }

        const [pembeli] = await pool.query("SELECT poin_loyalitas FROM pembeli WHERE id_pembeli = ?", [id_pembeli]);

        if (pembeli.length === 0) {
            return NextResponse.json({ error: "Pembeli not found!" }, { status: 404 });
        }

        if (pembeli[0].poin_loyalitas < total_poin) {
            return NextResponse.json({ error: "Not enough points to update the claim!" }, { status: 400 });
        }

        await pool.query(
            "UPDATE klaim SET id_pembeli = ?, id_merchandise = ?, jml_merch_diklaim = ?, total_poin = ? WHERE id_klaim = ?",
            [id_pembeli, id_merchandise, jml_merch_diklaim, total_poin, id_klaim]
        );

        await pool.query(
            "UPDATE pembeli SET poin_loyalitas = poin_loyalitas - ? WHERE id_pembeli = ?",
            [total_poin, id_pembeli]
        );

        return NextResponse.json({ message: "Klaim updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Klaim" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_klaim } = await request.json();

        if (!id_klaim) {
            return NextResponse.json({ error: "id_klaim is required!" }, { status: 400 });
        }

        const [klaimExists] = await pool.query("SELECT * FROM klaim WHERE id_klaim = ?", [id_klaim]);

        if (klaimExists.length === 0) {
            return NextResponse.json({ error: "Klaim not found!" }, { status: 404 });
        }

        const [klaim] = await pool.query("SELECT total_poin, id_pembeli FROM klaim WHERE id_klaim = ?", [id_klaim]);

        await pool.query(
            "UPDATE pembeli SET poin_loyalitas = poin_loyalitas + ? WHERE id_pembeli = ?",
            [klaim[0].total_poin, klaim[0].id_pembeli]
        );

        await pool.query("DELETE FROM klaim WHERE id_klaim = ?", [id_klaim]);

        return NextResponse.json({ message: "Klaim deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Klaim" }, { status: 500 });
    }
}
