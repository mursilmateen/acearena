'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import GameCard from '@/components/shared/GameCard';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { useGames } from '@/hooks/useBackendApi';
import { useGameJams } from '@/hooks/useBackendApi';
import { filterLiveLaunchGames } from '@/lib/launchConfig';

function HomePageContent() {
  const searchParams = useSearchParams();
  const { getGames } = useGames();
  const { getAllGameJams } = useGameJams();
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [jams, setJams] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filters: any = {};
        
        const search = searchParams.get('search');
        if (search) filters.search = search;

        const category = searchParams.get('category');
        if (category) filters.tags = [category];

        const tagsParam = searchParams.get('tags');
        if (tagsParam) {
          filters.tags = tagsParam.split(',');
        }

        const priceFilter = searchParams.get('price');
        if (priceFilter === 'free') {
          filters.maxPrice = 0;
        }

        const gamesData = await getGames(filters);
        
        let games = gamesData || [];

        const sort = searchParams.get('sort');
        if (sort === 'downloads') {
          games.sort((a: any, b: any) => (b.downloads || 0) - (a.downloads || 0));
        } else if (sort === 'rating') {
          games.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        } else if (sort === 'trending') {
          games.sort((a: any, b: any) => 
            (b.downloads || 0) - (a.downloads || 0) || 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        setFilteredGames(filterLiveLaunchGames(games));

        // Fetch jams
        const jamsData = await getAllGameJams();
        setJams(jamsData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setFilteredGames([]);
        setJams([]);
      }
    };

    fetchData();
  }, [searchParams, getGames, getAllGameJams]);

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black mb-2">
              Browse Games
            </h1>
            <p className="text-sm text-gray-600">
              Showing {filteredGames.length} result{filteredGames.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Game Grid */}
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
              {filteredGames.map((game, index) => (
                <GameCard
                  key={game.id || game._id || `${game.title || 'game'}-${index}`}
                  game={game}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 mb-16">
              <p className="text-sm text-gray-600 mb-4">
                No games found matching your search
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
              >
                View All Games
              </button>
            </div>
          )}

          {/* Active Game Jams Section */}
          <div className="border-t border-gray-200 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-black mb-1">Active Game Jams</h2>
                <p className="text-sm text-gray-600">Participate in challenges and compete with others</p>
              </div>
              <Link href="/jams">
                <Button className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 flex items-center gap-2">
                  View All Jams
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Active Jams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jams
                .slice(0, 3)
                .map((jam: any, index: number) => (
                  <Link
                    key={jam._id || jam.id || `${jam.title || 'jam'}-${index}`}
                    href={`/jams/${jam._id || jam.id}`}
                  >
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group h-full">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-black group-hover:text-gray-800 transition-colors flex-1">
                          {jam.title}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 bg-blue-50 text-blue-700 border border-blue-200`}>
                          Jam
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{jam.theme}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(jam.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {jam.participants?.length || 0} joined
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
