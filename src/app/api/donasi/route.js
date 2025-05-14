import pool from "@/lib/db";
import { NextResponse } from "next/server";


// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get("q");

//     let query = `
//       SELECT 
//         donasi.id_donasi, 
//         donasi.status_donasi, 
//         donasi.tanggal_acc, 
//         donasi.tanggal_donasi, 
//         donasi.nama_penerima, 
//         donasi.id_request, 
//         requestdonasi.deskripsi
//       FROM donasi
//       JOIN requestdonasi ON donasi.id_request = requestdonasi.id_request
//     `;

//     let values = [];

//     if (search) {
//       query += `
//         WHERE donasi.nama_penerima LIKE ? 
//         OR donasi.status_donasi LIKE ?
//       `;
//       values = [`%${search}%`, `%${search}%`];
//     }

//     const [rows] = await pool.query(query, values);

//     const donasi = rows.map((row) => ({
//       ...row,
//       barang_donasi: [] // agar frontend tidak error dan bisa tampil "Barang: -"
//     }));

//     return NextResponse.json({ donasi }, { status: 200 });

//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to fetch Donasi" }, { status: 500 });
//   }
// }



// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const search = searchParams.get("q");

//         let query = `
//             SELECT donasi.id_donasi, donasi.status_donasi, donasi.tanggal_acc, donasi.tanggal_donasi, 
//                    donasi.nama_penerima, donasi.id_request, requestdonasi.deskripsi
//             FROM donasi
//             JOIN requestdonasi ON donasi.id_request = requestdonasi.id_request
//         `;

//         let values = [];

//         if (search) {
//             query += `
//                 WHERE donasi.nama_penerima LIKE ? 
//                 OR donasi.status_donasi LIKE ?
//             `;
//             values = [`%${search}%`, `%${search}%`];
//         }

//         const [donasi] = await pool.query(query, values);

//         return NextResponse.json({ donasi }, { status: 200 });

//     } catch (error) {
//         return NextResponse.json({ error: "Failed to fetch Donasi" }, { status: 500 });
//     }
// }

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
       SELECT 
        donasi.id_donasi, 
        donasi.status_donasi, 
        donasi.tanggal_acc, 
        donasi.tanggal_donasi, 
        donasi.nama_penerima, 
        donasi.id_request, 
        requestdonasi.deskripsi,
        barang.id_barang,
        barang.nama_barang,
        barang.kode_produk
    FROM donasi
    JOIN requestdonasi ON donasi.id_request = requestdonasi.id_request
    LEFT JOIN barang ON barang.id_donasi = donasi.id_donasi
    `;

    let values = [];

    if (search) {
      query += `
        WHERE donasi.nama_penerima LIKE ? 
        OR donasi.status_donasi LIKE ?
      `;
      values = [`%${search}%`, `%${search}%`];
    }

    const [rows] = await pool.query(query, values);

    const grouped = {};

    for (const row of rows) {
      if (!grouped[row.id_donasi]) {
        grouped[row.id_donasi] = {
          id_donasi: row.id_donasi,
          status_donasi: row.status_donasi,
          tanggal_acc: row.tanggal_acc,
          tanggal_donasi: row.tanggal_donasi,
          nama_penerima: row.nama_penerima,
          id_request: row.id_request,
          deskripsi: row.deskripsi,
          barang_donasi: [],
        };
      }

      if (row.id_barang) {
        grouped[row.id_donasi].barang_donasi.push({
          id_barang: row.id_barang,
          nama_barang: row.nama_barang,
          kode_produk: row.kode_produk,
        });
      }
    }

    return NextResponse.json({ donasi: Object.values(grouped) }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch Donasi" }, { status: 500 });
  }
}



export async function POST(request) {
    try {
        const { status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_request } = await request.json();

        if (!status_donasi || !nama_penerima || !id_request) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        const [requestExists] = await pool.query(
            "SELECT id_request FROM requestdonasi WHERE id_request = ?",
            [id_request]
        );

        if (requestExists.length === 0) {
            return NextResponse.json({ error: "RequestDonasi not found!" }, { status: 404 });
        }

        const [donasiExists] = await pool.query(
            "SELECT id_donasi FROM donasi WHERE id_request = ?",
            [id_request]
        );

        if (donasiExists.length > 0) {
            return NextResponse.json({ error: "id_request already used in Donasi. Please use another one." }, { status: 409 });
        }

        await pool.query(
            "INSERT INTO donasi (status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_request) VALUES (?, ?, ?, ?, ?)",
            [status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_request]
        );

        return NextResponse.json({ message: "Donasi added successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message || "Failed to add Donasi" }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const { id_donasi, status_donasi, tanggal_acc, tanggal_donasi, nama_penerima } = await request.json();

        if (!id_donasi || !status_donasi || !nama_penerima) {
            return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
        }

        // Check if Donasi exists
        const [donasiExists] = await pool.query("SELECT * FROM donasi WHERE id_donasi = ?", [id_donasi]);

        if (donasiExists.length === 0) {
            return NextResponse.json({ error: "Donasi not found!" }, { status: 404 });
        }

        await pool.query(
            "UPDATE donasi SET status_donasi = ?, tanggal_acc = ?, tanggal_donasi = ?, nama_penerima = ? WHERE id_donasi = ?",
            [status_donasi, tanggal_acc, tanggal_donasi, nama_penerima, id_donasi]
        );

        return NextResponse.json({ message: "Donasi updated successfully!" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update Donasi" }, { status: 500 });
    }
}

// export async function DELETE(request) {
//     try {
//         const { id_donasi } = await request.json();

//         if (!id_donasi) {
//             return NextResponse.json({ error: "id_donasi is required!" }, { status: 400 });
//         }

//         // Check if Donasi exists
//         const [donasiExists] = await pool.query("SELECT * FROM donasi WHERE id_donasi = ?", [id_donasi]);

//         if (donasiExists.length === 0) {
//             return NextResponse.json({ error: "Donasi not found!" }, { status: 404 });
//         }

//         await pool.query("DELETE FROM donasi WHERE id_donasi = ?", [id_donasi]);

//         return NextResponse.json({ message: "Donasi deleted successfully!" }, { status: 200 });

//     } catch (error) {
//         return NextResponse.json({ error: "Failed to delete Donasi" }, { status: 500 });
//     }
// }

// export async function DELETE(request) {
//   try {
//     const { id_donasi } = await request.json();

//     if (!id_donasi) {
//       return NextResponse.json({ error: "id_donasi is required!" }, { status: 400 });
//     }

//     // Cek apakah donasi ada dan ambil id_request-nya
//     const [donasiData] = await pool.query(
//       "SELECT * FROM donasi WHERE id_donasi = ?",
//       [id_donasi]
//     );

//     if (donasiData.length === 0) {
//       return NextResponse.json({ error: "Donasi not found!" }, { status: 404 });
//     }

//     const donasi = donasiData[0];

//     // Hanya boleh hapus jika status_donasi = APPROVED
//     if (donasi.status_donasi !== 'APPROVED') {
//       return NextResponse.json({ error: "Hanya donasi dengan status APPROVED yang bisa dihapus." }, { status: 403 });
//     }

//     // 1. Set id_donasi di tabel barang menjadi NULL
//     await pool.query("UPDATE barang SET id_donasi = NULL WHERE id_donasi = ?", [id_donasi]);

//     // 2. Hapus donasi
//     await pool.query("DELETE FROM donasi WHERE id_donasi = ?", [id_donasi]);

//     // 3. Cek apakah masih ada donasi lain untuk id_request ini
//     const [remaining] = await pool.query(
//       "SELECT * FROM donasi WHERE id_request = ?",
//       [donasi.id_request]
//     );

//     // Jika tidak ada, ubah status requestdonasi menjadi 'PENDING'
//     if (remaining.length === 0) {
//       await pool.query(
//         "UPDATE requestdonasi SET status_request = 'PENDING' WHERE id_request = ?",
//         [donasi.id_request]
//       );
//     }

//     return NextResponse.json({ message: "Donasi berhasil dihapus dan data terkait diperbarui." }, { status: 200 });

//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to delete Donasi" }, { status: 500 });
//   }
// }

export async function DELETE(request) {
  try {
    const { id_donasi } = await request.json();

    if (!id_donasi) {
      return NextResponse.json({ error: "id_donasi is required!" }, { status: 400 });
    }

    // Ambil donasi
    const [donasiData] = await pool.query(
      "SELECT * FROM donasi WHERE id_donasi = ?",
      [id_donasi]
    );

    if (donasiData.length === 0) {
      return NextResponse.json({ error: "Donasi not found!" }, { status: 404 });
    }

    const donasi = donasiData[0];

    if (donasi.status_donasi !== 'APPROVED') {
      return NextResponse.json({ error: "Hanya donasi dengan status APPROVED yang bisa dihapus." }, { status: 403 });
    }

    // 1. Update barang: putuskan relasi & ubah status_titip ke DONATABLE
    await pool.query(`
      UPDATE barang 
      SET id_donasi = NULL, status_titip = 'DONATABLE' 
      WHERE id_donasi = ?
    `, [id_donasi]);

    // 2. Hapus donasi
    await pool.query("DELETE FROM donasi WHERE id_donasi = ?", [id_donasi]);

    // 3. Cek apakah masih ada donasi lain untuk request ini
    const [remaining] = await pool.query(
      "SELECT * FROM donasi WHERE id_request = ?",
      [donasi.id_request]
    );

    if (remaining.length === 0) {
      await pool.query(
        "UPDATE requestdonasi SET status_request = 'PENDING' WHERE id_request = ?",
        [donasi.id_request]
      );
    }

    return NextResponse.json({ message: "Donasi berhasil dihapus dan barang dikembalikan ke status DONATABLE." }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete Donasi" }, { status: 500 });
  }
}


