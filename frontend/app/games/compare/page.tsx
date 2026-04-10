'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useGames } from '@/hooks/useBackendApi';
import ComparisonTable from '@/components/shared/ComparisonTable';
import { Scale, ArrowLeft } from 'lucide-react';

export default function ComparisonPage() {
  const router = useRouter();
  const { comparisonGameIds, clearComparison } = useAppStore();
  const { getGameById } = useGames();
  const [comparisonGames, setComparisonGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComparisonGames = async () => {
      setLoading(true);
      try {
        const games = [];
        for (const gameId of comparisonGameIds) {
          const game = await getGameById(gameId);
          if (game) games.push(game);
        }
        setComparisonGames(games);
      } catch (error) {
        console.error('Failed to fetch comparison games:', error);
      } finally {
        setLoading(false);
      }
    };

    if (comparisonGameIds.length > 0) {
      fetchComparisonGames();
    } else {
      setComparisonGames([]);
    }
  }, [comparisonGameIds, getGameById]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <Scale className="w-8 h-8" />
            Game Comparison
          </h1>
          <p className="text-gray-600">
            {comparisonGames.length === 0
              ? 'Select up to 3 games to compare'
              : `Comparing ${comparisonGames.length} game${comparisonGames.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Content */}
        {comparisonGames.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-lg border border-gray-200 text-center">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Games Selected</h2>
            <p className="text-gray-600 mb-6">
              Click the compare button on game cards to add them to this comparison
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Browse Games
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={clearComparison}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear Comparison
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading games...</p>
              </div>
            ) : (
              <ComparisonTable games={comparisonGames} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <Scale className="w-8 h-8" />
            Game Comparison
          </h1>
          <p className="text-gray-600">
            {comparisonGames.length === 0
              ? 'Select up to 3 games to compare'
              : `Comparing ${comparisonGames.length} game${comparisonGames.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Content */}
        {comparisonGames.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-lg border border-gray-200 text-center">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Games Selected</h2>
            <p className="text-gray-600 mb-6">
              Click the compare button on game cards to add them to this comparison
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Browse Games
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={clearComparison}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear Comparison
              </button>
            </div>
            <ComparisonTable games={comparisonGames} />
          </>
        )}
      </div>
    </div>
  );
}
