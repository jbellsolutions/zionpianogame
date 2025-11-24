'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the game page
    router.push('/game');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="minecraft-panel p-8 text-center">
        <h1 className="font-minecraft text-white text-2xl mb-4">
          Loading Zion's Adventure...
        </h1>
        <div className="animate-bounce text-4xl">⛏️</div>
      </div>
    </div>
  );
}
