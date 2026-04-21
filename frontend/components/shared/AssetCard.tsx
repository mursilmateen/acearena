'use client';

import React from 'react';
import Link from 'next/link';
 
type AssetCardData = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  type?: string;
  category?: string;
  price?: number | string;
  thumbnail?: string | null;
  image?: string;
  fileType?: string;
  fileUrl?: string;
};

interface AssetCardProps {
  asset: AssetCardData;
}

export default function AssetCard({ asset }: AssetCardProps) {
  const assetId = asset._id || asset.id || '';
  const imageSrc = asset.thumbnail || asset.image || '/default-game-thumbnail.svg';
  const assetType = asset.type || asset.category || 'Asset';

  const fileType = (() => {
    if (asset.fileType) return asset.fileType;
    if (asset.fileUrl) {
      const ext = asset.fileUrl.split('?')[0].split('.').pop();
      return ext ? ext.toUpperCase() : 'Package';
    }
    return 'Package';
  })();

  const priceDisplay =
    typeof asset.price === 'number'
      ? asset.price === 0
        ? 'Free'
        : `$${asset.price.toFixed(2)}`
      : asset.price || 'Free';

  return (
    <Link href={assetId ? `/assets/${assetId}` : '/assets'}>
      <div className="group cursor-pointer">
        {/* Thumbnail - Square Container */}
        <div className="relative overflow-hidden bg-gray-100 rounded-lg mb-4 aspect-square">
          <img
            src={imageSrc}
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
              {assetType}
            </span>
          </div>

          {/* Footer: File Type & Price */}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
            <span className="text-gray-600">{fileType}</span>
            <span className="font-medium text-black">{priceDisplay}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
