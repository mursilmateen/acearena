'use client';

import React from 'react';
import Link from 'next/link';
import { Asset } from '@/data/assetsData';

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  return (
    <Link href={`/assets/${asset.id}`}>
      <div className="group cursor-pointer">
        {/* Thumbnail - Square Container */}
        <div className="relative overflow-hidden bg-gray-100 rounded-lg mb-4 aspect-square">
          <img
            src={asset.image}
            alt={asset.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block max-w-full"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-sm font-semibold text-black group-hover:text-gray-700 transition-colors line-clamp-2 leading-snug">
            {asset.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {asset.description}
          </p>

          {/* Category */}
          <div className="pt-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
              {asset.category}
            </span>
          </div>

          {/* Footer: File Type & Price */}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
            <span className="text-gray-600">{asset.fileType}</span>
            <span className="font-medium text-black">{asset.price || 'Free'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
