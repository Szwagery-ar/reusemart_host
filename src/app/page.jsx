'use client';  // This directive marks the file as a client component

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/login');  // Navigate to the login page
  };

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      <p>This is a basic Next.js home page.</p>
      <button onClick={navigateToLogin}>Go to Login</button>
    </div>
  );
}
