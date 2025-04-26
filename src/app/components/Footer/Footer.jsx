'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
    return (
        <div className="w-full bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)] overflow-hidden px-8 pt-8 mt-20">
            <div className="grid grid-cols-3 justify-between items-start text-white text-lg font-medium font-['Poppins'] leading-tight">
                <div className="flex flex-col justify-start gap-5">
                    <div className="text-6xl font-normal font-['Montage']">Ceritanya Logo</div>
                    <div className="w-72 flex justify-center items-center gap-12">
                        <div className="size-10 bg-white" />
                        <div className="w-5 h-10 bg-white" />
                        <div className="size-10 relative overflow-hidden">
                            <div className="size-7 left-[5.17px] top-[5.33px] absolute bg-white" />
                        </div>
                        <div className="size-10 bg-white" />
                    </div>
                </div>
                <div className="flex flex-col justify-start gap-4">
                    <div className="text-4xl font-normal font-['Montage'] uppercase">Informasi</div>
                    <div className="text-1xl font-light">Tentang Kami</div>
                    <div className="text-1xl font-light">Belanja</div>
                    <div className="text-1xl font-light">Bantuan</div>
                    <div className="text-1xl font-light">Ikut Jualan</div>
                </div>

                <div className="flex flex-col justify-start gap-6">
                    <div className="text-4xl font-normal font-['Montage'] uppercase leading-10">Kontak Kami</div>
                    <div className="text-1xl font-light">+62 812 3456 7890</div>
                    <div className="text-1xl font-light">info@reusemart.com</div>
                    <div className="text-1xl font-light">
                        Jl. Babarsari No.43, Janti, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
                    </div>
                </div>

            </div>
            <div className="text-center text-white text-sm font-medium pb-5 mt-20">
                © 2023 ReUse Mart. All Rights Reserved. Join us in building a sustainable future.
            </div>
        </div>
    );
}
