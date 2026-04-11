'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Folders, Plus, Trash2, Layers } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function CollectionsPage() {
  const router = useRouter();
  const { isAuthenticated, collections, createCollection, deleteCollection } = useAppStore();
  const { success, error } = useToast();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Access Control
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please login to manage your collections</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      error('Empty name', 'Please enter a collection name');
      return;
    }
    createCollection(newCollectionName);
    success('Collection created', newCollectionName);
    setNewCollectionName('');
    setShowForm(false);
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(id);
      success('Collection deleted');
    }
  };

  return (
    <DashboardLayout activeSection="collections" onSectionChange={() => {}}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
            <Folders className="w-8 h-8" />
            My Collections
          </h1>
          <p className="text-gray-500">
            {collections.length === 0
              ? 'Create collections to organize your favorite games'
              : `You have ${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Create Collection Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateCollection();
                }}
              />
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewCollectionName('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Create Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        )}

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-lg border border-gray-200 text-center">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Collections Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first collection to start organizing games
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Collection Header */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">{collection.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {collection.gameIds.length} game{collection.gameIds.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Games Preview */}
                <div className="p-4">
                  {collection.gameIds.length === 0 ? (
                    <p className="text-gray-500 text-sm">No games yet</p>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      Click a game card to view details from your collection
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
                    className="flex-1 px-3 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
