"use client";

import { useState } from "react";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Buttons */}
      <div className="flex gap-4">
        <a
          href="/showusers"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          SHOW USERS
        </a>
        <a
          href="/register"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          REGISTER USER
        </a>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="mt-4">Loading users...</p>}

      {/* User List */}
      {users.length > 0 && (
        <div className="mt-4 w-1/2">
          <h2 className="text-xl font-semibold mb-2">User List</h2>
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-gray-300 p-2 rounded mb-2"
            >
              <p><strong>Username:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
