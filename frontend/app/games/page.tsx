'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import GameCard from '@/components/shared/GameCard';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useGames } from '@/hooks/useBackendApi';
import { GameGridSkeleton } from '@/components/shared/Skeleton';

function GamesPageContent() {
  const searchParams = useSearchParams();
  const { getGames, loading } = useGames();
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const filters: any = {};
        
        const search = searchParams.get('search');
        if (search) filters.search = search;

        const tagsParam = searchParams.get('tags');
        if (tagsParam) filters.tags = tagsParam.split(',');

        const data = await getGames(filters);
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };

    fetchGames();
  }, [searchParams, getGames]);

  if (loading && games.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <GameGridSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Games
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} />
            Filters
          </Button>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link key={game._id} href={`/game/${game._id}`}>
              <GameCard game={game} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Sidebar />
      <div className="lg:col-span-3">
        <Suspense fallback={<div>Loading...</div>}>
          <GamesPageContent />
        </Suspense>
      </div>
    </div>
  );
}
