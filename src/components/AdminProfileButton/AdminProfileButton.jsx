"use client";

import { useRouter } from "next/navigation";

export default function AdminProfileButton({ user }) {
    const router = useRouter();

    const handleClick = () => {
        router.push("/admin/profile");
    };

    return (
        <button
            onClick={handleClick}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-600 flex items-center justify-center bg-gray-100 hover:scale-105 transition-all"
            title="Lihat Profil"
        >
            {user?.src_img_profile ? (
                <img
                    src={user.src_img_profile}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-indigo-700 font-bold text-lg">
                    {user?.nama?.charAt(0).toUpperCase()}
                </span>
            )}
        </button>
    );
}
