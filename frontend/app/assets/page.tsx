'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AssetSidebar from '@/components/layout/AssetSidebar';
import AssetCard from '@/components/shared/AssetCard';
import { useSearchParams } from 'next/navigation';
import { useAssets } from '@/hooks/useBackendApi';

function AssetsPageContent() {
  const searchParams = useSearchParams();
  const { getAllAssets, loading } = useAssets();
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const filters: any = {};

        // Category filter
        const category = searchParams.get('category');
        if (category) {
          filters.type = category;
        }

        // Price filter
        const priceFilter = searchParams.get('price');
        if (priceFilter === 'free') {
          filters.maxPrice = 0;
        } else if (priceFilter === 'under-5') {
          filters.maxPrice = 5;
        } else if (priceFilter === 'under-10') {
          filters.maxPrice = 10;
        }

        // File type filter is handled on frontend for now
        const data = await getAllAssets(filters);
        setFilteredAssets(data || []);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        setFilteredAssets([]);
      }
    };

    fetchAssets();
  }, [searchParams, getAllAssets]);

  const selectedCategory = searchParams.get('category');
  const selectedPrice = searchParams.get('price');
  const selectedFileType = searchParams.get('fileType');

  return (
    <div className="flex bg-white min-h-screen">
      <AssetSidebar
        selectedCategory={selectedCategory || undefined}
        selectedPrice={selectedPrice || undefined}
        selectedFileType={selectedFileType || undefined}
      />
      <main className="flex-1 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black mb-2">
              Game Assets Marketplace
            </h1>
            <p className="text-sm text-gray-600">
              Browse and download assets for your next game project
            </p>
          </div>

          {/* Asset Grid */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-600">Loading assets...</p>
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
              {filteredAssets.map((asset) => (
                <AssetCard key={asset._id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-gray-600 mb-4">
                No assets found matching your filters
              </p>
              <a
                href="/assets"
                className="inline-block px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
              >
                View All Assets
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense>
      <AssetsPageContent />
    </Suspense>
  );
}
