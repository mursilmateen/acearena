'use client';

import React from 'react';

export function GameCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse">
      <div className="h-40 sm:h-48 bg-slate-300 dark:bg-slate-600"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-4/5"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded-full w-16"></div>
          <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded-full w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function GameGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
