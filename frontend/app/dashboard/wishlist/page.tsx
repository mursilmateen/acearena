'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GameCard from '@/components/shared/GameCard';
import { useGames } from '@/hooks/useBackendApi';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, favoriteGameIds } = useAppStore();
  const { getGameById } = useGames();
  const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavoriteGames = async () => {
      setLoading(true);
      try {
        const games = [];
        for (const gameId of favoriteGameIds) {
          const game = await getGameById(gameId);
          if (game) games.push(game);
        }
        setFavoriteGames(games);
      } catch (error) {
        console.error('Failed to fetch favorite games:', error);
      } finally {
        setLoading(false);
      }
    };

    if (favoriteGameIds.length > 0) {
      fetchFavoriteGames();
    } else {
      setFavoriteGames([]);
    }
  }, [favoriteGameIds, getGameById]);

  // Access Control
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please login to view your wishlist</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeSection="wishlist" onSectionChange={() => {}}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-500">
            {favoriteGames.length === 0
              ? 'Add games to your wishlist to keep track of games you want to play'
              : `You have ${favoriteGames.length} game${favoriteGames.length !== 1 ? 's' : ''} in your wishlist`}
          </p>
        </div>

        {/* Content */}
        {favoriteGames.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-lg border border-gray-200 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Games Yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding games to your wishlist by clicking the heart icon on any game card
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Browse Games
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading games...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteGames.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
