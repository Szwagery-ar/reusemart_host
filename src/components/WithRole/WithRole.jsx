"use client";

import { useEffect, useState } from "react";

export default function WithRole({ allowed = [], children, fallback = null }) {
  const [allowedAccess, setAllowedAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (res.ok && data.success && allowed.includes(data.user.jabatan)) {
          setAllowedAccess(true);
        } else {
          setAllowedAccess(false);
        }
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
        setAllowedAccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [allowed]);

  if (loading) return <p>Memuat hak akses...</p>;

  if (!allowedAccess)
    return fallback || <p className="text-red-500">Anda tidak memiliki akses.</p>;

  return <>{children}</>;
}