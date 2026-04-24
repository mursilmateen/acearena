'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Download, ArrowRight, Gamepad2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGames } from '@/hooks/useBackendApi';
import { useRouter } from 'next/navigation';

interface FeaturedGame {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  thumbnail?: string;
  fileUrl?: string;
  rating?: number;
  downloads?: number;
}

export default function FeaturedGamesPage() {
  const router = useRouter();
  const { getGames } = useGames();
  const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        const data = await getGames({});
        const games = Array.isArray(data) ? (data as FeaturedGame[]) : [];
        
        // Filter for Falling Crown and Space Run
        const featured = games.filter((g: FeaturedGame) => 
          g.title?.toLowerCase().includes('falling crown') || 
          g.title?.toLowerCase().includes('space run')
        );
        
        setFeaturedGames(featured.slice(0, 2));
      } catch (error) {
        console.error('Failed to fetch featured games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, [getGames]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="w-10 h-10 text-purple-500" />
            <h1 className="text-5xl font-bold text-white">Featured Games</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Play incredible games right in your browser. No installation required.
          </p>
        </div>

        {/* Featured Games Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin">
              <Gamepad2 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        ) : featuredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {featuredGames.map((game) => (
              <div
                key={game._id || game.id}
                className="group relative overflow-hidden rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-500 transition-all duration-300"
              >
                {/* Game Thumbnail */}
                <div className="relative h-64 md:h-80 overflow-hidden bg-slate-900">
                  <img
                    src={game.thumbnail || '/default-game-thumbnail.svg'}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Game Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {game.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                    {game.downloads && (
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{game.downloads.toLocaleString()} downloads</span>
                      </div>
                    )}
                    {game.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{game.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        router.push(
                          `/game/${game._id || game.id}?action=play`
                        )
                      }
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Play Now
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/game/${game._id || game.id}`)
                      }
                      variant="outline"
                      className="flex-1 border-slate-600 hover:bg-slate-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 mb-6">No featured games available</p>
            <Link href="/games">
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Gamepad2 className="w-4 h-4" />
                Browse All Games
              </Button>
            </Link>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="border-t border-slate-700 pt-16 mt-16">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              More Games Awaiting
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Explore our complete library of indie games and start playing today!
            </p>
            <Link href="/games">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-slate-100 gap-2">
                <Gamepad2 className="w-5 h-5" />
                Explore All Games
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
