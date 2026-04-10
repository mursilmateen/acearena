'use client';

import React from 'react';
import Link from 'next/link';
import { Game } from '@/types';

interface GameRowProps {
  game: Game;
}

export default function GameRow({ game }: GameRowProps) {
  return (
    <>
      <div className="grid grid-cols-[160px_1fr_100px] gap-x-6 py-6 px-0 items-start hover:bg-gray-50 transition-all duration-150 rounded">
        {/* Column 1: Thumbnail */}
        <Link href={`/game/${game.id}`} className="flex-shrink-0">
          <img
            src={game.thumbnail || 'https://images.unsplash.com/photo-1538481143235-39bab5a55233?w=400&h=240&fit=crop'}
            alt={game.title}
            className="w-full h-24 object-cover rounded-sm"
          />
        </Link>

        {/* Column 2: Content */}
        <div className="flex flex-col justify-start min-w-0">
          <Link href={`/game/${game.id}`} className="group">
            <h3 className="text-lg font-semibold text-black group-hover:text-gray-700 transition-colors leading-snug">
              {game.title}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">
            {game.description}
          </p>

          {/* Tags */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {game.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
                {tag}
              </span>
            ))}
            {game.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{game.tags.length - 3}</span>
            )}
          </div>

          {/* Developer */}
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            by <span className="font-medium text-gray-500">{game.author}</span>
          </p>
        </div>

        {/* Column 3: Price */}
        <div className="flex items-start justify-end pt-1">
          <p className="text-sm font-medium text-black text-right w-full">
            {game.isFree ? 'Free' : `$${game.price.toFixed(2)}`}
          </p>
        </div>
      </div>
      <div className="border-b border-gray-200"></div>
    </>
  );
}
