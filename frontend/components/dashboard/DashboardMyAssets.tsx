'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAssets } from '@/hooks/useBackendApi';
import { Trash2, Edit, Loader } from 'lucide-react';

type DashboardAsset = {
  _id: string;
  title: string;
  thumbnail?: string;
  createdAt?: string | Date;
  type?: string;
  price?: number;
};

export default function DashboardMyAssets() {
  const { user } = useAppStore();
  const { getUserAssets, deleteAsset, loading } = useAssets();
  const [assets, setAssets] = useState<DashboardAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const userRole = user?.role || 'player';

  useEffect(() => {
    if (userRole === 'developer') {
      loadAssets();
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  const loadAssets = async () => {
    try {
      const data = await getUserAssets();
      setAssets(Array.isArray(data) ? (data as DashboardAsset[]) : []);
    } catch (error) {
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    setDeleteLoading(assetId);
    try {
      await deleteAsset(assetId);
      // Remove from list
      setAssets(assets.filter(a => a._id !== assetId));
    } catch (error) {
      // Error toast is already shown by the hook
    } finally {
      setDeleteLoading(null);
    }
  };

  // Only show this section for developers
  if (userRole === 'player') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-black mb-2">
            My Assets
          </h1>
          <p className="text-gray-600">
            Assets you've uploaded will appear here
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            Switch to a Developer account to upload assets
          </p>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all duration-200">
            Start Uploading Assets
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-black mb-2">My Assets</h1>
          <p className="text-gray-600">Manage your uploaded assets</p>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-200 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-black mb-2">
          My Assets
        </h1>
        <p className="text-gray-600">
          Manage your uploaded assets
        </p>
      </div>

      {/* Assets List */}
      {assets.length > 0 ? (
        <div className="space-y-4">
          {assets.map((asset) => (
            <div
              key={asset._id}
              className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 hover:border-gray-300 transition-all duration-200"
            >
              {/* Thumbnail */}
              {asset.thumbnail && (
                <img
                  src={asset.thumbnail}
                  alt={asset.title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0 block max-w-full"
                />
              )}

              {/* Asset Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-black mb-1">
                  {asset.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  Created: {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
                <div className="flex gap-3">
                  <span className="text-xs font-medium text-black capitalize">
                    {asset.type || 'Asset'}
                  </span>
                  {(asset.price ?? 0) > 0 && (
                    <span className="text-xs font-medium text-black">
                      ${asset.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(asset._id)}
                  disabled={deleteLoading === asset._id}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 disabled:opacity-50"
                >
                  {deleteLoading === asset._id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">No assets uploaded yet</p>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all duration-200">
            Upload Your First Asset
          </button>
        </div>
      )}
    </div>
  );
}
