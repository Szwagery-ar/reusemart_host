import { Suspense } from "react";
import PembayaranPage from "./PembayaranClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading halaman pembayaran...</div>}>
      <PembayaranPage />
    </Suspense>
  );
}
