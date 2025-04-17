import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `SELECT bbc.*, p.nama AS pembeli_nama, brg.nama_barang 
                        FROM bridgebarangcart bbc 
                    JOIN cart c ON bbc.id_cart = c.id_cart 
                    JOIN pembeli p ON c.id_pembeli = p.id_pembeli
                    JOIN barang brg ON bbc.id_barang = brg.id_barang`;
        let values = [];

        if (search) {
            query += `
                WHERE bbc.id_cart LIKE ? 
                OR bbc.id_barang LIKE ?
                OR p.nama LIKE ?
                OR brg.nama_barang LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [bridgeData] = await pool.query(query, values);
        return NextResponse.json({ bridgeData }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bridge data" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { id_cart, id_barang } = await request.json();

        if (!id_cart || !id_barang) {
            return NextResponse.json({ error: "id_cart and id_barang are required!" }, { status: 400 });
        }

        const [barangResult] = await pool.query(
            `SELECT status_titip FROM barang WHERE id_barang = ?`,
            [id_barang]
        );

        if (barangResult.length === 0) {
            return NextResponse.json({ error: "Barang not found!" }, { status: 404 });
        }

        const status = barangResult[0].status_titip;
        const forbiddenStatuses = ["HOLD", "SOLD", "EXPIRED", "DONATABLE", "DONATED"];

        if (forbiddenStatuses.includes(status)) {
            return NextResponse.json({
                error: `Cannot add barang to cart: status_titip is '${status}'`
            }, { status: 400 });
        }

        await pool.query(
            `INSERT INTO bridgebarangcart (id_cart, id_barang) VALUES (?, ?)`,
            [id_cart, id_barang]
        );

        return NextResponse.json({ message: "Bridge entry added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to add bridge entry" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_bridge_barang, is_checkout } = await request.json();

        // Check if required values are present
        if (id_bridge_barang === undefined || is_checkout === undefined) {
            return NextResponse.json({ error: "id_bridge_barang and is_checkout are required!" }, { status: 400 });
        }

        // Check if the bridge entry exists and get the related id_barang
        const [bridgeResult] = await pool.query(
            `SELECT * FROM bridgebarangcart WHERE id_bridge_barang = ?`,
            [id_bridge_barang]
        );

        if (bridgeResult.length === 0) {
            return NextResponse.json({ error: "Bridge not found!" }, { status: 404 });
        }

        const bridge = bridgeResult[0];
        const id_barang = bridge.id_barang;

        // If trying to checkout, check the barang status
        if (is_checkout === true) {
            const [barangResult] = await pool.query(
                `SELECT status_titip FROM barang WHERE id_barang = ?`,
                [id_barang]
            );

            if (barangResult.length === 0) {
                return NextResponse.json({ error: "Barang not found!" }, { status: 404 });
            }

            const forbiddenStatuses = ["HOLD", "SOLD", "EXPIRED", "DONATABLE", "DONATED"];
            const status = barangResult[0].status_titip;

            if (forbiddenStatuses.includes(status)) {
                return NextResponse.json({
                    error: `Cannot checkout: barang is currently marked as '${status}'`
                }, { status: 400 });
            }
        }

        // Update is_checkout
        await pool.query(
            `UPDATE bridgebarangcart SET is_checkout = ? WHERE id_bridge_barang = ?`,
            [is_checkout ? 1 : 0, id_bridge_barang]
        );

        return NextResponse.json({ message: "is_checkout updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update is_checkout" }, { status: 500 });
    }
}



export async function DELETE(request) {
    try {
        const { id_bridge_barang } = await request.json();

        if (!id_bridge_barang) {
            return NextResponse.json({ error: "id_bridge_barang is required!" }, { status: 400 });
        }

        const [exists] = await pool.query(
            `SELECT * FROM bridgebarangcart WHERE id_bridge_barang = ?`,
            [id_bridge_barang]
        );

        if (exists.length === 0) {
            return NextResponse.json({ error: "Bridge entry not found!" }, { status: 404 });
        }

        await pool.query(
            `DELETE FROM bridgebarangcart WHERE id_bridge_barang = ?`,
            [id_bridge_barang]
        );

        return NextResponse.json({ message: "Bridge entry deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete bridge entry" }, { status: 500 });
    }
}
