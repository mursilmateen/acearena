'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { useAssets } from '@/hooks/useBackendApi';
import { useToast } from '@/hooks/useToast';
import { AlertCircle, Loader } from 'lucide-react';
import UpgradeModal from '@/components/modals/UpgradeModal';

export default function UploadAssetPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const { createAsset, uploadAssetFile, loading } = useAssets();
  const { success, error: errorToast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Access Control
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 border-l-4 border-black bg-gray-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-black mb-2">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please login to your account to upload assets
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (user?.role !== 'developer') {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 border-l-4 border-black bg-gray-50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-black mb-2">
                  Developer Account Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Upgrade your account to a developer account to upload assets
                </p>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '', // Changed from category to type
    price: '',
  });

  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const assetTypes = [
    '2D Assets',
    '3D Models',
    'UI Kits',
    'Sound Effects',
    'Music',
    'Sprites',
    'Plugins',
    'Shaders',
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssetFile(file);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title || !formData.description || !formData.type) {
      setFormError('Title, description, and type are required');
      return;
    }

    setIsSaving(true);

    try {
      // Create asset with basic info
      const assetData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price) || 0,
      };

      const createdAsset = await createAsset(assetData);

      // Upload file if provided
      if (assetFile && createdAsset._id) {
        try {
          await uploadAssetFile(createdAsset._id, assetFile);
        } catch (err) {
          console.error('Asset file upload failed:', err);
        }
      }

      success('Asset uploaded successfully!');
      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push('/dashboard?section=assets');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to upload asset';
      setFormError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Upload Asset
        </h1>
        <p className="text-gray-500">
          Share your game development asset with the AceArena community
        </p>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {formError}
          </p>
        </div>
      )}

      {/* Form */}
      <Card className="p-8 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Asset Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Fantasy UI Kit"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Description *
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your asset in detail..."
              rows={5}
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Asset Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            >
              <option value="">Select an asset type</option>
              {assetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Price
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <span className="text-gray-600">Free if left empty</span>
            </div>
          </div>

          {/* Asset File Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Asset File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="assetFile"
                required
              />
              <label htmlFor="assetFile" className="cursor-pointer">
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Any file up to 500MB</p>
                {assetFile && (
                  <div className="mt-4 text-green-600 font-medium">
                    ✓ {assetFile.name}
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Thumbnail (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Thumbnail (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="thumbnailFile"
              />
              <label htmlFor="thumbnailFile" className="cursor-pointer">
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                {thumbnail && (
                  <div className="mt-4 text-green-600 font-medium">
                    ✓ {thumbnail.name}
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSaving || loading}
              className="flex-1 bg-black text-white hover:bg-gray-800 py-3 font-semibold disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                  Uploading...
                </>
              ) : (
                'Upload Asset'
              )}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-black hover:bg-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
