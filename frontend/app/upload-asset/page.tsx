'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { useAssets, useProfile } from '@/hooks/useBackendApi';
import { useToast } from '@/hooks/useToast';
import { AlertCircle, Loader } from 'lucide-react';
import UpgradeModal from '@/components/modals/UpgradeModal';
import apiClient from '@/lib/api';

type ApiErrorDetail = {
  field?: string;
  message?: string;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
  details?: ApiErrorDetail[];
};

const fieldLabelMap: Record<string, string> = {
  title: 'Asset title',
  description: 'Description',
  type: 'Asset type',
  price: 'Price',
};

const getFieldLabel = (field?: string) => {
  if (!field) return 'Field';
  return fieldLabelMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const errorWithResponse = error as {
    response?: {
      status?: number;
      data?: ApiErrorPayload;
    };
    message?: string;
  };

  const apiData = errorWithResponse.response?.data;
  const details = Array.isArray(apiData?.details) ? apiData.details : [];

  if (details.length > 0) {
    const formatted = details
      .map((detail) => {
        if (!detail?.message) return null;
        return `${getFieldLabel(detail.field)}: ${detail.message}`;
      })
      .filter(Boolean)
      .join(' | ');

    if (formatted) {
      return formatted;
    }
  }

  if (typeof apiData?.error === 'string' && apiData.error.trim()) {
    return apiData.error;
  }

  if (typeof apiData?.message === 'string' && apiData.message.trim()) {
    return apiData.message;
  }

  if (typeof errorWithResponse.message === 'string' && errorWithResponse.message.trim()) {
    return errorWithResponse.message;
  }

  return fallback;
};

const isZipFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith('.zip') ||
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed'
  );
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

type AssetUploadStage = 'idle' | 'creating' | 'file' | 'thumbnail' | 'finalizing';

const getAssetUploadStageMessage = (stage: AssetUploadStage) => {
  switch (stage) {
    case 'creating':
      return 'Creating asset record';
    case 'file':
      return 'Uploading package file';
    case 'thumbnail':
      return 'Uploading thumbnail';
    case 'finalizing':
      return 'Finalizing upload';
    default:
      return 'Preparing upload';
  }
};

const getAssetUploadProgress = (stage: AssetUploadStage) => {
  switch (stage) {
    case 'creating':
      return 20;
    case 'file':
      return 75;
    case 'thumbnail':
      return 90;
    case 'finalizing':
      return 96;
    default:
      return 5;
  }
};

export default function UploadAssetPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const { createAsset, uploadAssetFile, uploadAssetThumbnail, loading } = useAssets();
  const { getProfile } = useProfile();
  const { success, error: errorToast } = useToast();
  const fieldClassName = 'h-11 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black';
  const textAreaClassName = 'min-h-[140px] border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStage, setUploadStage] = useState<AssetUploadStage>('idle');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '', // Changed from category to type
    price: '',
  });
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  // Access Control
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>
    );
  }

  if (user?.role !== 'developer') {
    return (
      <>
        <div className="min-h-screen bg-white py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </>
    );
  }

  const assetTypes = [
    { value: '2D', label: '2D Assets' },
    { value: '3D', label: '3D Models' },
    { value: 'audio', label: 'Sound Effects' },
    { value: 'music', label: 'Music' },
    { value: 'plugin', label: 'Plugins / Tools' },
    { value: 'other', label: 'Other' },
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
    if (!file) return;

    if (!isZipFile(file)) {
      setFormError(`Selected file "${file.name}" is not a .zip package`);
      setAssetFile(null);
      e.target.value = '';
      return;
    }

    setFormError(null);
    setAssetFile(file);
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

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description || !formData.type) {
      setFormError('Title, description, and type are required');
      return;
    }

    if (title.length < 3) {
      setFormError('Asset title must be at least 3 characters');
      return;
    }

    if (description.length < 10) {
      setFormError('Description must be at least 10 characters');
      return;
    }

    const selectedAssetFile = assetFile || assetFileInputRef.current?.files?.[0] || null;

    if (!selectedAssetFile) {
      setFormError('Asset package (.zip) is required');
      return;
    }

    if (!isZipFile(selectedAssetFile)) {
      setFormError('Asset package must be a valid .zip file');
      return;
    }

    setIsSaving(true);
    setUploadStage('creating');
    let createdAssetId: string | null = null;

    try {
      // Create asset with basic info
      const assetData = {
        title,
        description,
        type: formData.type,
        price: parseFloat(formData.price) || 0,
      };

      const createdAsset = await createAsset(assetData);
      createdAssetId = createdAsset?._id || null;

      if (!createdAssetId) {
        throw new Error('Asset record was created without a valid ID');
      }

      // Upload package file (required)
      setUploadStage('file');
      const uploadedAsset = await uploadAssetFile(createdAssetId, selectedAssetFile);
      if (!uploadedAsset?.fileUrl) {
        throw new Error('Asset package upload did not complete successfully');
      }

      // Upload thumbnail if provided
      if (thumbnail && createdAssetId) {
        setUploadStage('thumbnail');
        try {
          await uploadAssetThumbnail(createdAssetId, thumbnail);
        } catch (err) {
          console.error('Asset thumbnail upload failed:', err);
        }
      }

      setUploadStage('finalizing');
      try {
        await getProfile({ silent: true });
      } catch (refreshError) {
        console.warn('Failed to refresh profile stats after upload:', refreshError);
      }

      success('Asset uploaded successfully!');
      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push('/dashboard?section=assets');
      }, 2000);
    } catch (err: unknown) {
      // Avoid orphaned metadata entries when file upload fails.
      if (createdAssetId) {
        try {
          await apiClient.delete(`/assets/${createdAssetId}`);
        } catch (cleanupError) {
          console.error('Failed to rollback asset after upload failure:', cleanupError);
        }
      }

      const errorMessage = getApiErrorMessage(err, 'Failed to upload asset');
      setFormError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsSaving(false);
      setUploadStage('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Upload Asset Package
          </h1>
          <p className="text-gray-500">
            Upload one .zip package that includes sprites, audio, fonts, docs, and license files
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

        {isSaving && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-emerald-900">
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                {getAssetUploadStageMessage(uploadStage)}
              </span>
              <span>{getAssetUploadProgress(uploadStage)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
                style={{ width: `${getAssetUploadProgress(uploadStage)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-emerald-800">
              Upload in progress. Please keep this tab open until completion.
            </p>
          </div>
        )}

        {/* Form */}
        <Card className="p-8 border border-gray-200 bg-white text-black ring-0">
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
              className={fieldClassName}
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
              className={textAreaClassName}
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
              className="h-11 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
              required
            >
              <option value="">Select an asset type</option>
              {assetTypes.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>
                  {typeOption.label}
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
                  className={fieldClassName}
                />
              </div>
              <span className="text-gray-600">Free if left empty</span>
            </div>
          </div>

          {/* Asset File Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Asset Package (.zip) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleFileUpload}
                className="hidden"
                id="assetFile"
                ref={assetFileInputRef}
              />
              <label htmlFor="assetFile" className="cursor-pointer">
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">One .zip package up to 100MB</p>
                <p className="text-xs text-gray-500 mt-1">
                  Include everything in one archive: sprites, audio, fonts, docs, and LICENSE
                </p>
                {assetFile && (
                  <div className="mt-4 text-green-600 font-medium break-all">
                    ✓ {assetFile.name} ({formatFileSize(assetFile.size)})
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
              className={`flex-1 py-3 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-100 ${
                isSaving
                  ? 'bg-emerald-600 hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                  {getAssetUploadStageMessage(uploadStage)} ({getAssetUploadProgress(uploadStage)}%)
                </>
              ) : loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                  Preparing...
                </>
              ) : (
                'Upload Asset'
              )}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              disabled={isSaving || loading}
              className="flex-1 border border-gray-400 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:opacity-100"
            >
              Cancel
            </Button>
          </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
