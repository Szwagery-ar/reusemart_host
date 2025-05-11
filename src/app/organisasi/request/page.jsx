'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, EllipsisVertical } from "lucide-react";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

export default function OrgRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [requestList, setRequestList] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me');

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    fetchRequestOrg();
                } else {
                  setUser(null);
                  setError(userData.message || 'User not authenticated');
                  router.push('/login');
                }
            } else {
              setUser(null);
              setError(userData.message || 'User not authenticated');
              if (res.status === 401) {
                  router.push('/login');
              }
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Terjadi kesalahan');
        } finally {
            setUserLoading(false);
        }
    };

    fetchUserData();
  }, [router]);

  // REQUEST
  const fetchRequestOrg = async () => {
    try {
      setRequestLoading(true);
      const res = await fetch('/api/requestdonasi/by-org', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("SQL fetch error:", error);
        console.error("Gagal mengambil request:", errorData.error || res.status);
        return;
      }

      const data = await res.json();
      setRequestList(data.request);
    } catch (err) {
      setError('Gagal mengambil data Request');
      console.error('Error fetching request data:', err);
    } finally {
      setRequestLoading(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(".", "");
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-4xl font-[Montage-Demo]">Request Donasi</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="semua" className="mb-4">
        <TabsList className="flex gap-4">
          {[
            "Semua",
            "Pending",
            "Diterima",
            "Selesai",
            "Dibatalkan",
          ].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase().replace(/ /g, "-")}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Search and Filters */}
      <div className="flex gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Cari deskripsi request"
          className="text-base px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="relative">
          <Button variant="outline" className="flex items-center gap-5">
            Tanggal Request <CalendarIcon size={16} />
          </Button>
        </div>
        <Input type="date" className="w-1/4" />
      </div>

      <div className="overflow-x-auto flex flex-col">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <th className="px-5 py-3 text-white text-left">Action</th>
              <th className="px-5 py-3 text-white text-left">ID</th>
              <th className="px-5 py-3 text-white text-left">Tanggal Request</th>
              <th className="px-5 py-3 text-white text-left">Deskripsi</th>
              <th className="px-5 py-3 text-white text-left">Status Request</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {/* Items */}
            {requestList.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="w-full flex flex-row justify-center p-4 mt-3 rounded-xl border-1 border-black text-sm">
                    <p>Belum ada Request Donasi dibuat.</p>
                  </div>
                </td>
              </tr>
            ) : (
                requestList.map((item, index) => (
                  <tr key={item.id_request} className="rounded-xl border border-black text-sm hover:bg-gray-50">
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                      <EllipsisVertical />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.id_request}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.tanggal_request}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.deskripsi}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.status_request}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {requestList.length > 0 && (
          <div className="mt-2 mb-4 flex justify-center items-center gap-2">
            <Button variant="outline" size="sm">1</Button>
            <Button variant="ghost" size="sm">▶</Button>
          </div>
        )}
      </div>
    </div>
  );
}
