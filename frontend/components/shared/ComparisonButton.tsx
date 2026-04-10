'use client';

import React from 'react';
import { Scale } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/useToast';

interface ComparisonButtonProps {
  gameId: string;
  gameName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ComparisonButton({
  gameId,
  gameName,
  showText = false,
  size = 'md',
}: ComparisonButtonProps) {
  const { comparisonGameIds, addToComparison, removeFromComparison } = useAppStore();
  const { info, warning } = useToast();
  const isInComparison = comparisonGameIds.includes(gameId);

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInComparison) {
      removeFromComparison(gameId);
      info('Removed from comparison', gameName || 'Game removed');
    } else {
      if (comparisonGameIds.length >= 3) {
        warning('Maximum 3 games', 'You can only compare up to 3 games at a time');
        return;
      }
      addToComparison(gameId);
      info('Added to comparison', gameName || 'Game added');
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <button
      onClick={handleToggleComparison}
      className={`transition-all duration-200 hover:scale-110 ${
        isInComparison ? 'text-purple-600' : 'text-gray-400 hover:text-purple-400'
      }`}
      title={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
      aria-label={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
    >
      <Scale className={sizeClasses[size]} />
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isInComparison ? 'Comparing' : 'Compare'}
        </span>
      )}
    </button>
  );
}
