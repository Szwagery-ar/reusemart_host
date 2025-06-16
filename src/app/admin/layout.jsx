import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import AdminProfileButton from "@/components/AdminProfileButton/AdminProfileButton";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login/admin");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    redirect("/login/admin");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  const data = await res.json();

  if (!data.success) {
    redirect("/login/admin");
  }

  const user = data.user;

  return (
    <div className="flex">
      <AdminSidebar user={user} />
      <main className="flex-1 p-6 ml-64 relative">
        <div className="absolute top-6 right-6 z-10">
          <AdminProfileButton user={user} />
        </div>
        {children}
      </main>
    </div>
  );
}
