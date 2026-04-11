'use client';

import React from 'react';
import { Game } from '@/types';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import Link from 'next/link';

interface ComparisonTableProps {
  games: Game[];
}

type AttributeKey = 'title' | 'author' | 'price' | 'rating' | 'downloads' | 'reviews' | 'tags';

export default function ComparisonTable({ games }: ComparisonTableProps) {
  const { removeFromComparison } = useAppStore();

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No games selected for comparison</p>
      </div>
    );
  }

  const attributes: Array<{ key: AttributeKey; label: string }> = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Developer' },
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'downloads', label: 'Downloads' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'tags', label: 'Tags' },
  ];

  const getComparisonId = (game: Game) => game.id ?? game._id;

  const renderAttributeValue = (game: Game, key: AttributeKey) => {
    if (key === 'price') {
      if (game.isFree) {
        return <span>Free</span>;
      }

      return <span>{typeof game.price === 'number' ? `$${game.price.toFixed(2)}` : '-'}</span>;
    }

    if (key === 'tags') {
      return (
        <div className="flex flex-wrap gap-1 justify-center">
          {(game.tags ?? []).map((tag: string) => (
            <span
              key={tag}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    }

    if (key === 'author') {
      return <span>{game.author || '-'}</span>;
    }

    if (key === 'rating' || key === 'downloads' || key === 'reviews') {
      const value = game[key];
      return <span>{typeof value === 'number' ? value : '-'}</span>;
    }

    return <span>{game.title || '-'}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {/* Game Images Row */}
          <tr className="border-b border-gray-200">
            <td className="p-4 bg-gray-50 font-semibold text-black w-32">Game</td>
            {games.map((game) => {
              const comparisonId = getComparisonId(game);
              const gameKey = comparisonId ?? game.title;

              return (
                <td key={gameKey} className="p-4 text-center">
                  <div className="mb-4">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (comparisonId) {
                        removeFromComparison(comparisonId);
                      }
                    }}
                    disabled={!comparisonId}
                    className="text-red-500 hover:text-red-700 transition-colors inline-flex items-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </td>
              );
            })}
          </tr>

          {/* Attribute Rows */}
          {attributes.map((attr, index) => (
            <tr key={attr.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-4 font-semibold text-black bg-gray-50 w-32">{attr.label}</td>
              {games.map((game) => {
                const gameKey = getComparisonId(game) ?? game.title;

                return (
                  <td key={gameKey} className="p-4 text-center text-gray-700">
                    {renderAttributeValue(game, attr.key)}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Action Row */}
          <tr className="border-t border-gray-200 bg-gray-50">
            <td className="p-4 font-semibold text-black">Action</td>
            {games.map((game) => {
              const comparisonId = getComparisonId(game);
              const gameKey = comparisonId ?? game.title;

              return (
                <td key={gameKey} className="p-4 text-center">
                  <Link href={comparisonId ? `/game/${comparisonId}` : '/games'}>
                    <button
                      disabled={!comparisonId}
                      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      View Details
                    </button>
                  </Link>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
