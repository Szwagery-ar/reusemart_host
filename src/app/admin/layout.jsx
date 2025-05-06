import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="">
      <AdminSidebar />
      <main className="ml-64 p-6">{children}</main>
    </div>
  );
}
