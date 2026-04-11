'use client';

import React from 'react';
import Link from 'next/link';
import { Game } from '@/types';
import FavoriteButton from './FavoriteButton';
import ComparisonButton from './ComparisonButton';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const gameId = game.id ?? game._id;
  const gameHref = gameId ? `/game/${gameId}` : '/games';
  const priceLabel = game.isFree ? 'Free' : typeof game.price === 'number' ? `$${game.price.toFixed(2)}` : 'N/A';

  return (
    <Link href={gameHref}>
      <div className="group cursor-pointer">
        {/* Thumbnail - Square Container with Action Buttons */}
        <div className="relative overflow-hidden bg-gray-100 rounded-lg mb-4 aspect-square">
          <img
            src={game.thumbnail || 'https://images.unsplash.com/photo-1538481143235-39bab5a55233?w=400&h=400&fit=crop'}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block max-w-full"
          />
          {/* Action Buttons - Top Right */}
          {gameId && (
            <div className="absolute top-3 right-3 z-10 flex gap-2" onClick={(e) => e.preventDefault()}>
              {/* Favorite Button */}
              <div className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                <FavoriteButton gameId={gameId} gameName={game.title} size="md" />
              </div>
              {/* Comparison Button */}
              <div className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                <ComparisonButton gameId={gameId} gameName={game.title} size="md" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-sm font-semibold text-black group-hover:text-gray-700 transition-colors line-clamp-2 leading-snug">
            {game.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {game.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-1">
            {game.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
                {tag}
              </span>
            ))}
            {game.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{game.tags.length - 2}</span>
            )}
          </div>

          {/* Footer: Author & Price */}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
            <span className="text-gray-600">{game.author}</span>
            <span className="font-medium text-black">
              {priceLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
