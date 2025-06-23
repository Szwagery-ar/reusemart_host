'use client';

import { useEffect, useState } from 'react';

export default function PegawaiPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  return (
    <div>
      {user ? (
        <h1>Welcome {user.userName}, you are a {user.userType}</h1>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
