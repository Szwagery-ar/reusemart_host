import OrganisasiSidebar from '@/components/OrganisasiSidebar/OrganisasiSidebar';

export default function OrganisasiLayout({ children }) {
  return (
    <div className="">
      <OrganisasiSidebar />
      <main className="ml-64 p-6">{children}</main>
    </div>
  );
}
