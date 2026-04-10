'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { useGames } from '@/hooks/useBackendApi';

export default function TagsPage() {
  const router = useRouter();
  const { getGames } = useGames();
  const [tagStats, setTagStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamesAndExtractTags = async () => {
      try {
        const games = await getGames({});
        const tagMap = new Map<string, number>();
        
        games.forEach((game: any) => {
          if (game.tags && Array.isArray(game.tags)) {
            game.tags.forEach((tag: string) => {
              tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
            });
          }
        });
        
        const stats = Array.from(tagMap.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        
        setTagStats(stats);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesAndExtractTags();
  }, [getGames]);

  const handleTagClick = (tag: string) => {
    router.push(`/?tags=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Tags' },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-3 flex items-center gap-3">
            <Tag className="w-10 h-10" />
            Browse by Tags
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Explore games by their categories and genres. Click any tag to filter games.
          </p>
        </div>

        {/* Tags Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading tags...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tagStats.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 group cursor-pointer text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-black group-hover:text-gray-700 transition-colors capitalize">
                      {tag}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {count} game{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-700 group-hover:bg-gray-200 transition-colors">
                    {count}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tagStats.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No tags available</p>
          </div>
        )}
      </div>
    </div>
  );
}
