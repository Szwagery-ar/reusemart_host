import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { ForbiddenError, UnauthorizedError } from './errors';
import { unauthorized } from 'next/navigation';

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyUserRole(allowedRoles = []) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("no token provided");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let jabatan = null;

    if (decoded.role === 'pegawai') {
      const [result] = await pool.query(`
        SELECT j.nama_jabatan FROM pegawai p
        LEFT JOIN jabatan j ON p.id_jabatan = j.id_jabatan
        WHERE p.id_pegawai = ?
      `, [decoded.id]);

      if (result.length === 0) {
        throw new UnauthorizedError("Pegawai not found");
      }

      jabatan = result[0].nama_jabatan;
    } else {
      throw new ForbiddenError("You do not have permission");
    }

    if (!allowedRoles.includes(jabatan)) {
      throw new ForbiddenError("You do not have permission");
    }

    return {
      id: decoded.id,
      role: decoded.role,
      jabatan
    };

  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw err;
  }
}
