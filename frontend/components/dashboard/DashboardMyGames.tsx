'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useGames } from '@/hooks/useBackendApi';
import { Trash2, Edit, Loader } from 'lucide-react';

type DashboardGame = {
  _id: string;
  title: string;
  thumbnail?: string;
  createdAt?: string | Date;
  price?: number;
};

export default function DashboardMyGames() {
  const { user } = useAppStore();
  const { getUserGames, deleteGame, loading } = useGames();
  const [games, setGames] = useState<DashboardGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const userRole = user?.role || 'player';

  useEffect(() => {
    if (userRole === 'developer') {
      loadGames();
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  const loadGames = async () => {
    try {
      const data = await getUserGames();
      setGames(Array.isArray(data) ? (data as DashboardGame[]) : []);
    } catch (error) {
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) {
      return;
    }

    setDeleteLoading(gameId);
    try {
      await deleteGame(gameId);
      // Remove from list
      setGames(games.filter(g => g._id !== gameId));
    } catch (error) {
      // Error toast is already shown by the hook
    } finally {
      setDeleteLoading(null);
    }
  };

  // Only show this section for developers
  if (userRole === 'player') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-black mb-2">
            My Games
          </h1>
          <p className="text-gray-600">
            Games you've uploaded will appear here
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            Switch to a Developer account to manage games and upload assets.
          </p>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all duration-200">
            Game Uploads Coming Soon
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-black mb-2">My Games</h1>
          <p className="text-gray-600">Manage your uploaded games</p>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-200 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-black mb-2">
          My Games
        </h1>
        <p className="text-gray-600">
          Manage your uploaded games. New game submissions are temporarily paused.
        </p>
      </div>

      {/* Games List */}
      {games.length > 0 ? (
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game._id}
              className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 hover:border-gray-300 transition-colors"
            >
              {/* Thumbnail */}
              {game.thumbnail && (
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-24 h-24 rounded object-cover flex-shrink-0"
                />
              )}

              {/* Game Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-black mb-1">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Created: {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
                <div>
                  <span className="text-xs font-semibold text-gray-600 capitalize">
                    {(game.price ?? 0) > 0 ? 'Paid' : 'Free'}
                  </span>
                  {(game.price ?? 0) > 0 && (
                    <span className="text-xs font-semibold text-gray-600 ml-4">
                      ${game.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(game._id)}
                  disabled={deleteLoading === game._id}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                >
                  {deleteLoading === game._id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">No games uploaded yet</p>
          <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
            Game Uploads Coming Soon
          </button>
        </div>
      )}
    </div>
  );
}
