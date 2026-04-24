'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2 } from 'lucide-react';

export default function AssetDetailPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to featured games page
    router.replace('/assets');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Gamepad2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold text-white mb-2">Redirecting...</h1>
        <p className="text-slate-400">Taking you to featured games</p>
      </div>
    </div>
  );
}
