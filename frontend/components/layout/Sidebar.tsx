'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { POPULAR_TAGS } from '@/data/games';

export default function Sidebar() {
  const searchParams = useSearchParams();

  const categories = [
    { name: 'Horror' },
    { name: 'Action' },
    { name: 'Adventure' },
    { name: 'Multiplayer' },
    { name: 'Visual Novel' },
  ];

  const priceOptions = [
    { label: 'Free', value: 'free' },
    { label: 'Paid', value: 'paid' },
    { label: 'Under $5', value: 'under-5' },
    { label: 'Under $10', value: 'under-10' },
  ];

  const sortOptions = [
    { label: 'Popular', href: '/?sort=downloads' },
    { label: 'Newest', href: '/?sort=trending' },
    { label: 'Price Low to High', href: '/?sort=price' },
  ];

  const selectedPrice = searchParams.get('price');

  return (
    <aside className="hidden lg:block w-72 border-r border-gray-200 sticky top-16 h-[calc(100vh-64px)] bg-white overflow-hidden flex flex-col">
      <div className="p-6 overflow-y-auto flex-1 space-y-5">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">
            Categories
          </h3>
          <nav className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/?category=${encodeURIComponent(category.name)}`}
                className={`block text-left px-0 py-1.5 text-sm transition-colors leading-snug ${
                  searchParams.get('category') === category.name
                    ? 'text-black font-semibold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-black">
              Tags
            </h3>
            {searchParams.get('tags') && (
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-black transition-colors"
              >
                Clear
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.slice(0, 8).map((tag) => {
              const tagsParam = searchParams.get('tags');
              const selectedTags = tagsParam ? tagsParam.split(',') : [];
              const isSelected = selectedTags.includes(tag);
              const newTags = isSelected
                ? selectedTags.filter((t) => t !== tag)
                : [...selectedTags, tag];
              const href = newTags.length > 0 ? `/?tags=${newTags.join(',')}` : '/';
              
              return (
                <Link
                  key={tag}
                  href={href}
                  className={`text-xs transition-all rounded-sm px-2 py-1 ${
                    isSelected
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">
            Price
          </h3>
          <nav className="space-y-1.5">
            {priceOptions.map((option) => (
              <Link
                key={option.value}
                href={`/?price=${option.value}`}
                className="flex items-center gap-2 cursor-pointer py-1"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedPrice === option.value ? 'border-black bg-black' : 'border-gray-400'
                }`}>
                  {selectedPrice === option.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm transition-colors ${selectedPrice === option.value ? 'text-black font-medium' : 'text-gray-600'}`}>
                  {option.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-2">
            Sort By
          </h3>
          <div className="space-y-1.5">
            {sortOptions.map((option) => (
              <Link
                key={option.label}
                href={option.href}
                className="block text-sm text-gray-600 hover:text-black hover:underline transition-colors py-1"
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
