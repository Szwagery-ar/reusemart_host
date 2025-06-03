import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { sendFirebasePushNotification } from "@/utils/sendFirebasePushNotification";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    let query = `
            SELECT requestdonasi.id_request, requestdonasi.tanggal_request, requestdonasi.deskripsi, 
                   requestdonasi.status_request, requestdonasi.id_organisasi, organisasi.nama AS nama_organisasi
            FROM requestdonasi
            LEFT JOIN organisasi ON requestdonasi.id_organisasi = organisasi.id_organisasi
        `;

    let values = [];

    if (search) {
      query += `
                WHERE requestdonasi.deskripsi LIKE ? 
                OR requestdonasi.status_request LIKE ?
                OR organisasi.nama LIKE ?
            `;
      values = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const [requestDonasi] = await pool.query(query, values);

    return NextResponse.json({ requestDonasi }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch RequestDonasi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { tanggal_request, deskripsi, status_request, id_organisasi } =
      await request.json();

    if (!tanggal_request || !deskripsi || !status_request || !id_organisasi) {
      return NextResponse.json(
        { error: "All fields are required!" },
        { status: 400 }
      );
    }

    const [orgExists] = await pool.query(
      "SELECT id_organisasi FROM organisasi WHERE id_organisasi = ?",
      [id_organisasi]
    );

    if (orgExists.length === 0) {
      return NextResponse.json(
        { error: "Organisasi not found!" },
        { status: 404 }
      );
    }

    await pool.query(
      "INSERT INTO requestdonasi (tanggal_request, deskripsi, status_request, id_organisasi) VALUES (?, ?, ?, ?)",
      [tanggal_request, deskripsi, status_request, id_organisasi]
    );

    return NextResponse.json(
      { message: "RequestDonasi added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add RequestDonasi" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      id_request,
      tanggal_request,
      deskripsi,
      status_request,
      mode,
      daftarBarang = [],
    } = await request.json();

    if (!id_request || !status_request) {
      return NextResponse.json(
        { error: "id_request dan status_request wajib diisi!" },
        { status: 400 }
      );
    }

    const [requestExists] = await pool.query(
      "SELECT * FROM requestdonasi WHERE id_request = ?",
      [id_request]
    );

    if (requestExists.length === 0) {
      return NextResponse.json(
        { error: "RequestDonasi not found!" },
        { status: 404 }
      );
    }

    // 🔧 Update kolom yang dikirim
    let updateFields = [];
    let updateValues = [];

    if (tanggal_request) {
      updateFields.push("tanggal_request = ?");
      updateValues.push(tanggal_request);
    }
    if (deskripsi) {
      updateFields.push("deskripsi = ?");
      updateValues.push(deskripsi);
    }
    if (status_request) {
      updateFields.push("status_request = ?");
      updateValues.push(status_request);
    }

    updateValues.push(id_request);

    const updateQuery = `UPDATE requestdonasi SET ${updateFields.join(
      ", "
    )} WHERE id_request = ?`;
    await pool.query(updateQuery, updateValues);

    // 🚀 Jika status APPROVED dan mode atur_barang, tambahkan donasi + relasikan barang
    if (mode === "atur_barang" && status_request === "APPROVED") {
      const [requestDetail] = await pool.query(
        `
        SELECT r.id_request, r.id_organisasi, o.nama AS nama_organisasi
        FROM requestdonasi r
        JOIN organisasi o ON r.id_organisasi = o.id_organisasi
        WHERE r.id_request = ?
      `,
        [id_request]
      );

      if (requestDetail.length > 0) {
        const { nama_organisasi } = requestDetail[0];

        // ✅ Insert donasi baru
        const [result] = await pool.query(
          `
          INSERT INTO donasi (id_request, status_donasi, tanggal_acc, nama_penerima)
          VALUES (?, 'APPROVED', NOW(), ?)
        `,
          [id_request, nama_organisasi]
        );

        const id_donasi_baru = result.insertId;

        // ✅ Update setiap barang terpilih agar dikaitkan dengan donasi
        if (Array.isArray(daftarBarang)) {
          for (const id_barang of daftarBarang) {
            await pool.query(
              "UPDATE barang SET id_donasi = ?, status_titip = 'DONATED' WHERE id_barang = ?",
              [id_donasi_baru, id_barang]
            );

            // 🔔 Cek penitip dan kirim notifikasi
            const [penitipInfo] = await pool.query(
              `
                SELECT p.expo_push_token, p.nama AS nama_penitip, b.nama_barang
                FROM barang b
                JOIN penitip p ON b.id_penitip = p.id_penitip
                WHERE b.id_barang = ?
              `,
              [id_barang]
            );

            if (penitipInfo.length > 0) {
              const { expo_push_token, nama_penitip, nama_barang } =
                penitipInfo[0];

              if (expo_push_token) {
                await sendFirebasePushNotification(
                  expo_push_token,
                  "Barangmu Sudah Didonasikan 🥳",
                  `${nama_penitip}, barang '${nama_barang}' telah didonasikan oleh ReUseMart. Terima kasih atas kontribusinya!`
                );
              }
            }
          }
        }
      }
    }

    return NextResponse.json(
      { message: "RequestDonasi updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update RequestDonasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id_request } = await request.json();

    if (!id_request) {
      return NextResponse.json(
        { error: "id_request is required!" },
        { status: 400 }
      );
    }

    const [requestExists] = await pool.query(
      "SELECT * FROM requestdonasi WHERE id_request = ?",
      [id_request]
    );

    if (requestExists.length === 0) {
      return NextResponse.json(
        { error: "RequestDonasi not found!" },
        { status: 404 }
      );
    }

    await pool.query("DELETE FROM requestdonasi WHERE id_request = ?", [
      id_request,
    ]);

    return NextResponse.json(
      { message: "RequestDonasi deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete RequestDonasi" },
      { status: 500 }
    );
  }
}
