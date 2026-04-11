import React, { Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import GamesPageClient from './GamesPageClient';
import { GameGridSkeleton } from '@/components/shared/Skeleton';

function SidebarFallback() {
  return <aside className="hidden lg:block w-72 border-r border-gray-200 bg-white" />;
}

function GamesPageFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <GameGridSkeleton key={i} />
      ))}
    </div>
  );
}

export default function GamesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <div className="lg:col-span-3">
        <Suspense fallback={<GamesPageFallback />}>
          <GamesPageClient />
        </Suspense>
      </div>
    </div>
  );
}
