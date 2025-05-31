import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT c.*, p.nama AS pembeli_nama, b.nama_barang, b.harga_barang
            FROM cart c
            JOIN pembeli p ON c.id_pembeli = p.id_pembeli
            JOIN bridgebarangcart bc ON c.id_cart = bc.id_cart
            JOIN barang b ON bc.id_barang = b.id_barang
        `;
        let values = [];

        if (search) {
            query += ` WHERE c.id_cart LIKE ? OR c.id_pembeli LIKE ? OR p.nama LIKE ? OR b.nama_barang LIKE ?`;
            values = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [cart] = await pool.query(query, values);

        return NextResponse.json({ cart }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}



export async function POST(request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const id_pembeli = decoded.id;
        const role = decoded.role;

        if (role !== "pembeli") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const [existingCart] = await pool.query(
            "SELECT * FROM cart WHERE id_pembeli = ?",
            [id_pembeli]
        );

        if (existingCart.length > 0) {
            return NextResponse.json({
                message: "Cart already exists!",
                id_cart: existingCart[0].id_cart,
            }, { status: 200 });
        }

        const [result] = await pool.query(
            "INSERT INTO cart (id_pembeli) VALUES (?)",
            [id_pembeli]
        );

        return NextResponse.json({
            message: "Cart created successfully!",
            id_cart: result.insertId
        }, { status: 201 });

    } catch (error) {
        console.error("POST /api/cart error:", error);
        return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { id_cart, id_pembeli } = await request.json();

        if (!id_cart || !id_pembeli) {
            return NextResponse.json({ error: "id_cart and id_pembeli are required!" }, { status: 400 });
        }

        const [cartExists] = await pool.query("SELECT * FROM cart WHERE id_cart = ?", [id_cart]);

        if (cartExists.length === 0) {
            return NextResponse.json({ error: "Cart not found!" }, { status: 404 });
        }

        const [pembeliExists] = await pool.query(
            "SELECT * FROM pembeli WHERE id_pembeli = ?",
            [id_pembeli]
        );

        if (pembeliExists.length === 0) {
            return NextResponse.json({
                error: "id_pembeli not found!"
            }, { status: 404 });
        }

        const [existingCart] = await pool.query(
            "SELECT * FROM cart WHERE id_pembeli = ? AND id_cart != ?",
            [id_pembeli, id_cart]
        );

        if (existingCart.length > 0) {
            return NextResponse.json({
                error: "This pembeli already has a different cart!"
            }, { status: 409 });
        }

        await pool.query(
            "UPDATE cart SET id_pembeli = ? WHERE id_cart = ?",
            [id_pembeli, id_cart]
        );

        return NextResponse.json({ message: "Cart updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Cart" }, { status: 500 });
    }
}


export async function DELETE(request) {
    try {
        const { id_cart } = await request.json();

        if (!id_cart) {
            return NextResponse.json({ error: "id_cart is required!" }, { status: 400 });
        }

        const [cartExists] = await pool.query("SELECT * FROM cart WHERE id_cart = ?", [id_cart]);

        if (cartExists.length === 0) {
            return NextResponse.json({ error: "Cart not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM cart WHERE id_cart = ?", [id_cart]);

        return NextResponse.json({ message: "Cart deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete cart" }, { status: 500 });
    }
}