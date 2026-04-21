'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import AssetCard from '@/components/shared/AssetCard';
import { useAssets } from '@/hooks/useBackendApi';

type AssetDetail = {
  _id: string;
  title: string;
  description: string;
  type?: string;
  price?: number;
  thumbnail?: string;
  fileUrl?: string;
};

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const { getAssetById, getAllAssets, loading } = useAssets();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [relatedAssets, setRelatedAssets] = useState<AssetDetail[]>([]);

  const formattedPrice =
    typeof asset?.price === 'number'
      ? asset.price === 0
        ? 'Free'
        : `$${asset.price.toFixed(2)}`
      : 'Free';

  const fileType = asset?.fileUrl
    ? (asset.fileUrl.split('?')[0].split('.').pop() || 'package').toUpperCase()
    : 'ZIP';

  const handleDownload = () => {
    if (!asset?.fileUrl) return;
    window.open(asset.fileUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        const assetData = await getAssetById(assetId);
        setAsset(assetData);

        if (assetData?.type) {
          const allAssets = await getAllAssets({ type: assetData.type });
          setRelatedAssets((allAssets?.filter((a: AssetDetail) => a._id !== assetId).slice(0, 4) || []) as AssetDetail[]);
        }
      } catch (error) {
        console.error('Failed to fetch asset:', error);
      }
    };

    if (assetId) {
      fetchAssetData();
    }
  }, [assetId, getAssetById, getAllAssets]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading asset...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">
            Asset Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The asset you are looking for does not exist or has been removed.
          </p>
          <Button 
            onClick={() => window.location.href = '/assets'}
            className="bg-black text-white hover:bg-gray-800"
          >
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={asset.thumbnail || '/default-game-thumbnail.svg'}
          alt={asset.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  {asset.title}
                </h1>
                <div className="flex items-center gap-4 text-white/80 flex-wrap">
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md">
                    <FileText className="w-4 h-4" />
                    {asset.type || 'Asset'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleDownload}
                  disabled={!asset.fileUrl}
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-3 w-full transition-colors disabled:opacity-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {asset.fileUrl ? (asset.price === 0 ? 'Download Free' : `Buy - ${formattedPrice}`) : 'Package Not Available Yet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-4">
                About This Asset
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {asset.description}
              </p>
            </Card>

            {/* Details */}
            <Card className="p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">
                Asset Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-black">{asset.type || 'Asset'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">File Type</span>
                  <span className="font-medium text-black">{fileType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-black">{formattedPrice}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Asset ID</span>
                  <span className="font-mono text-sm text-gray-500">{asset._id}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Asset Info Card */}
            <Card className="p-6 border border-gray-200 sticky top-20">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-3xl font-bold text-black">{formattedPrice}</p>
                </div>
                <Button
                  onClick={handleDownload}
                  disabled={!asset.fileUrl}
                  className="w-full bg-black text-white hover:bg-gray-800 py-3 font-semibold disabled:opacity-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {asset.fileUrl ? (asset.price === 0 ? 'Download Now' : 'Buy Now') : 'Package Not Available'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Assets */}
        {relatedAssets.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-8">
              More {asset.type || 'Related'} Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedAssets.map((relatedAsset) => (
                <AssetCard key={relatedAsset._id} asset={relatedAsset} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
