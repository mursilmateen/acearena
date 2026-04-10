'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/useToast';

interface FavoriteButtonProps {
  gameId: string;
  gameName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({
  gameId,
  gameName,
  showText = false,
  size = 'md',
}: FavoriteButtonProps) {
  const { favoriteGameIds, addFavorite, removeFavorite } = useAppStore();
  const { success } = useToast();
  const isFavorited = favoriteGameIds.includes(gameId);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorited) {
      removeFavorite(gameId);
      success('Removed from wishlist', gameName || 'Game removed');
    } else {
      addFavorite(gameId);
      success('Added to wishlist', gameName || 'Game added');
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`transition-all duration-200 hover:scale-110 ${
        isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      }`}
      title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`${sizeClasses[size]} ${isFavorited ? 'fill-current' : ''}`}
      />
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}
