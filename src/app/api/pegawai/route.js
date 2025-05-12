import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { verifyUserRole } from '@/lib/auth';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';

export async function GET(request) {
    try {
        await verifyUserRole(["Admin", "Superuser"]);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q");

        let query = `
            SELECT pegawai.id, pegawai.id_pegawai, pegawai.nama, pegawai.email, pegawai.no_telepon, 
                   pegawai.tanggal_lahir, pegawai.komisi, pegawai.id_jabatan, jabatan.nama_jabatan 
            FROM pegawai 
            JOIN jabatan ON pegawai.id_jabatan = jabatan.id_jabatan
        `;

        let values = [];

        if (search) {
            query += `
                WHERE pegawai.nama LIKE ? 
                OR pegawai.email LIKE ? 
                OR jabatan.nama_jabatan LIKE ?
            `;
            values = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const [pegawai] = await pool.query(query, values);

        return NextResponse.json({ pegawai }, { status: 200 });

    } catch (error) {

        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: "Anda tidak memiliki akses ke halaman ini" }, { status: 403 });
        }
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: "Token tidak valid atau telah kedaluwarsa" }, { status: 401 });
        }

        console.error("Database fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch Pegawai" }, { status: 500 });
    }
}


export async function POST(request) {
    try {
        const { nama, email, password, no_telepon, tanggal_lahir, komisi, id_jabatan } = await request.json();

        // Validasi input
        if (!nama || !email || !password || !no_telepon || !tanggal_lahir || !id_jabatan) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Cek apakah email sudah ada di pegawai
        const [existingEmail] = await pool.query("SELECT email FROM pegawai WHERE email = ?", [email]);
        if (existingEmail.length > 0) {
            return NextResponse.json({ error: "Email already exists in Pegawai." }, { status: 400 });
        }

        // Cek apakah email sudah ada di pembeli
        const [existingPembeli] = await pool.query("SELECT email FROM pembeli WHERE email = ?", [email]);
        if (existingPembeli.length > 0) {
            return NextResponse.json({ error: "Email already exists in Pembeli." }, { status: 400 });
        }

        // Cek apakah email sudah ada di penitip
        const [existingPenitip] = await pool.query("SELECT email FROM penitip WHERE email = ?", [email]);
        if (existingPenitip.length > 0) {
            return NextResponse.json({ error: "Email already exists in Penitip." }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert pegawai baru
        const [result] = await pool.query(
            "INSERT INTO pegawai (nama, email, password, no_telepon, tanggal_lahir, komisi, id_jabatan) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nama, email, hashedPassword, no_telepon, tanggal_lahir, komisi || 0, id_jabatan]
        );

        const id_pegawai = result.insertId;
        const id = `P${id_pegawai}`;

        await pool.query("UPDATE pegawai SET id = ? WHERE id_pegawai = ?", [id, id_pegawai]);

        return NextResponse.json({ message: "Pegawai added successfully!", id, id_pegawai }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to add Pegawai", details: error.message }, { status: 500 });
    }
}


// export async function POST(request) {
//     try {
//         // Verifikasi token dan cek apakah pegawai yang melakukan request adalah admin
//         const pegawai = await verifyTokenAndCheckAdmin(request);

//         const { nama, email, password, no_telepon, tanggal_lahir, komisi, id_jabatan } = await request.json();

//         // Validasi input
//         if (!nama || !email || !password || !no_telepon || !tanggal_lahir || !id_jabatan) {
//             return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
//         }

//         // Cek apakah email sudah ada di tabel pegawai
//         const [existingEmail] = await pool.query("SELECT email FROM pegawai WHERE email = ?", [email]);
//         if (existingEmail.length > 0) {
//             return NextResponse.json({ error: "Email already exists! Please use a different email." }, { status: 400 });
//         }

//         // Cek apakah email sudah ada di pembeli
//         const [existingPembeli] = await pool.query("SELECT email FROM pembeli WHERE email = ?", [email]);
//         if (existingPembeli.length > 0) {
//             return NextResponse.json({ error: "Email already exists in Pembeli! Please use a different email." }, { status: 400 });
//         }

//         // Cek apakah email sudah ada di penitip
//         const [existingPenitip] = await pool.query("SELECT email FROM penitip WHERE email = ?", [email]);
//         if (existingPenitip.length > 0) {
//             return NextResponse.json({ error: "Email already exists in Penitip! Please use a different email." }, { status: 400 });
//         }

//         // Cek apakah jabatan pegawai yang melakukan request adalah admin
//         if (pegawai.jabatan !== 'admin') {
//             return NextResponse.json({ error: "Only admins can add new pegawai." }, { status: 403 });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert pegawai baru ke database
//         const [result] = await pool.query(
//             "INSERT INTO pegawai (nama, email, password, no_telepon, tanggal_lahir, komisi, id_jabatan) VALUES (?, ?, ?, ?, ?, ?, ?)",
//             [nama, email, hashedPassword, no_telepon, tanggal_lahir, komisi, id_jabatan]
//         );

//         // Menyusun ID pegawai
//         const id_pegawai = result.insertId;
//         const id = `P${id_pegawai}`;

//         // Update ID pegawai pada tabel
//         await pool.query("UPDATE pegawai SET id = ? WHERE id_pegawai = ?", [id, id_pegawai]);

//         // Return response sukses
//         return NextResponse.json({ message: "Pegawai added successfully!", id, id_pegawai }, { status: 201 });

//     } catch (error) {
//         console.error(error);

//         if (
//             error.message === 'No token provided' ||
//             error.message === 'Not a pegawai' ||
//             error.message === 'Pegawai not found' ||
//             error.message === 'Forbidden'
//         ) {
//             return NextResponse.json({ error: error.message }, { status: 403 });
//         }

//         return NextResponse.json({ error: "Failed to add Penitip", details: error.message }, { status: 500 });
//     }
// }


export async function PUT(request) {
    try {
        const { id_pegawai, nama, email, no_telepon, tanggal_lahir, komisi, id_jabatan } = await request.json();

        if (!id_pegawai || !nama || !email || !no_telepon || !tanggal_lahir || !id_jabatan) {
            console.log("Missing fields:", { id_pegawai, nama, email, no_telepon, tanggal_lahir, komisi, id_jabatan });
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [existingPegawai] = await pool.query("SELECT * FROM pegawai WHERE id_pegawai = ?", [id_pegawai]);

        if (existingPegawai.length === 0) {
            return NextResponse.json({ error: "Pegawai not found!" }, { status: 404 });
        }

        const [existingEmail] = await pool.query("SELECT email FROM pegawai WHERE email = ?", [email]);

        if (existingEmail.length > 0) {
            return NextResponse.json({ error: "Email already exists! Please use a different email." }, { status: 400 });
        }

        await pool.query(
            "UPDATE pegawai SET nama = ?, email = ?, no_telepon = ?, tanggal_lahir = ?, komisi = ?, id_jabatan = ? WHERE id_pegawai = ?",
            [nama, email, no_telepon, tanggal_lahir, komisi, id_jabatan, id_pegawai]
        );
        // await pool.query(
        //     "UPDATE pegawai SET p.nama = ?, p.email = ?, p.no_telepon = ?, p.tanggal_lahir = ?, p.komisi = ?, j.nama_jabatan = ? JOIN jabatan ON pegawai.id_jabatan = jabatan.id_jabatan WHERE id_pegawai = ?",
        //     [nama, email, no_telepon, tanggal_lahir, komisi, id_jabatan, id_pegawai]
        // );

        return NextResponse.json({ message: "Pegawai updated successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Error updating Pegawai:", error);
        return NextResponse.json({ error: "Failed to update Pegawai" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_pegawai } = await request.json();

        if (!id_pegawai) {
            return NextResponse.json({ error: "id_pegawai is required!" }, { status: 400 });
        }

        const [existingPegawai] = await pool.query("SELECT * FROM pegawai WHERE id_pegawai = ?", [id_pegawai]);

        if (existingPegawai.length === 0) {
            return NextResponse.json({ error: "Pegawai not found!" }, { status: 404 });
        }

        await pool.query("DELETE FROM pegawai WHERE id_pegawai = ?", [id_pegawai]);

        return NextResponse.json({ message: "Pegawai deleted successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to delete Pegawai" }, { status: 500 });
    }
}