"use client";

import { useEffect, useState } from "react";

export default function MyComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users); // Store fetched users in state
        console.log("Fetched Users:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="">GET DATA</h1>
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "5px 0" }}>
            <p><strong>Username:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ))
      ) : (
        <p>Loading users...</p>
      )}
    </div>
  );
}
