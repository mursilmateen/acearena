'use client';

import React from 'react';
import Link from 'next/link';

const CATEGORY_OPTIONS = [
  { value: '2D', label: '2D Assets' },
  { value: '3D', label: '3D Models' },
  { value: 'audio', label: 'Sound Effects' },
  { value: 'music', label: 'Music' },
  { value: 'plugin', label: 'Plugins / Tools' },
  { value: 'other', label: 'Other' },
];

const PRICE_OPTIONS = [
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
  { label: 'Under $5', value: 'under-5' },
  { label: 'Under $10', value: 'under-10' },
];

const FILE_TYPES = ['ZIP Package'];

interface AssetSidebarProps {
  selectedCategory?: string;
  selectedPrice?: string;
  selectedFileType?: string;
}

export default function AssetSidebar({
  selectedCategory,
  selectedPrice,
  selectedFileType,
}: AssetSidebarProps) {
  return (
    <aside className="hidden lg:block w-72 border-r border-gray-200 sticky top-16 h-[calc(100vh-64px)] bg-white overflow-hidden flex flex-col">
      <div className="p-6 overflow-y-auto flex-1 space-y-5">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">
            Category
          </h3>
          <nav className="space-y-2">
            {CATEGORY_OPTIONS.map((category) => (
              <Link
                key={category.value}
                href={`/assets?category=${encodeURIComponent(category.value)}`}
                className={`block text-left px-0 py-1.5 text-sm transition-colors leading-snug ${
                  selectedCategory === category.value
                    ? 'text-black font-semibold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Price */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">
            Price
          </h3>
          <nav className="space-y-2">
            {PRICE_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={`/assets?price=${option.value}`}
                className="flex items-center gap-2 py-1.5"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedPrice === option.value ? 'border-black bg-black' : 'border-gray-400'
                }`}>
                  {selectedPrice === option.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm transition-colors ${
                  selectedPrice === option.value
                    ? 'text-black font-semibold'
                    : 'text-gray-600 hover:text-black'
                }`}>
                  {option.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* File Type */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">
            File Type
          </h3>
          <nav className="space-y-2">
            {FILE_TYPES.map((fileType) => (
              <Link
                key={fileType}
                href={`/assets?fileType=${encodeURIComponent(fileType)}`}
                className={`block text-left px-0 py-1.5 text-sm transition-colors leading-snug ${
                  selectedFileType === fileType
                    ? 'text-black font-semibold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {fileType}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
