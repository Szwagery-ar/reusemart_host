'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center bg-[radial-gradient(ellipse_130.87%_392.78%_at_101.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
            <p className="mb-5 text-xs">Error 404: Page Not Found</p>
            <h1 className="font-[Montage-Demo] text-9xl">Tobangado?</h1>
            <img 
                src="/images/404/spongegar.png" 
                alt="Tobangado?" 
                className="w-md mb-5"
            />
                <p className="text-lg mb-4">Halaman yang kamu cari kayaknya nggak ada atau sudah dihapus.</p>
                <div onClick={() => router.push('/')} className="text-lg font-semibold underline cursor-pointer">Kembali ke Beranda</div>
        </div>
    );
}