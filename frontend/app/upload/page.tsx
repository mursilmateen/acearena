'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Upload, X, AlertCircle, Loader, Info } from 'lucide-react';
import { useGames, useProfile } from '@/hooks/useBackendApi';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/useToast';
import UpgradeModal from '@/components/modals/UpgradeModal';
import { detectGameFormat, getGameFormatInfo, canPlayInBrowser, GameFormat } from '@/lib/gameFormatUtils';
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

type UploadStage = 'idle' | 'creating' | 'thumbnail' | 'file' | 'finalizing';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const errorWithResponse = error as {
    response?: {
      data?: ApiErrorPayload;
    };
    message?: string;
  };

  const apiData = errorWithResponse.response?.data;
  const details = Array.isArray(apiData?.details) ? apiData.details : [];

  if (details.length > 0) {
    const detailMessage = details
      .map((detail) => detail?.message)
      .filter(Boolean)
      .join(' | ');

    if (detailMessage) {
      return detailMessage;
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

const isUnsupportedArchiveFileName = (fileName: string): boolean => {
  const lowerName = fileName.toLowerCase();
  return (
    lowerName.endsWith('.7z') ||
    lowerName.endsWith('.rar') ||
    lowerName.endsWith('.tar') ||
    lowerName.endsWith('.tar.gz') ||
    lowerName.endsWith('.tgz')
  );
};

const archiveRejectionMessage =
  'Archive upload rejected: only .zip browser builds are supported. Export your game for web and upload the .zip that includes index.html and all build assets.';

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const { createGame, uploadGameThumbnail, uploadGameFile, deleteGame, loading } = useGames();
  const { getProfile } = useProfile();
  const { success, error: errorToast } = useToast();
  const fieldClassName = 'h-11 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black';
  const textAreaClassName = 'min-h-[160px] border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    isFree: true,
    price: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<GameFormat>('other');
  const [formatInfo, setFormatInfo] = useState(getGameFormatInfo('other'));

  const getUploadStageMessage = (stage: UploadStage) => {
    switch (stage) {
      case 'creating':
        return 'Creating game record';
      case 'thumbnail':
        return 'Uploading thumbnail';
      case 'file':
        return 'Uploading game file';
      case 'finalizing':
        return 'Finalizing upload';
      default:
        return 'Preparing upload';
    }
  };

  const getUploadProgress = (stage: UploadStage) => {
    switch (stage) {
      case 'creating':
        return 20;
      case 'thumbnail':
        return 45;
      case 'file':
        return 80;
      case 'finalizing':
        return 95;
      default:
        return 5;
    }
  };

  // Access Control
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Card className="p-8 border-l-4 border-black bg-gray-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please login to your account to upload games
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="bg-black text-white hover:bg-gray-800 rounded-md"
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
                  Upgrade your account to a developer account to upload games
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleGameFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isUnsupportedArchiveFileName(file.name)) {
        setFormError(archiveRejectionMessage);
        setGameFile(null);
        e.target.value = '';
        return;
      }

      setFormError(null);
      setGameFile(file);
      
      // Detect game format from filename
      const format = detectGameFormat(file.name);
      setDetectedFormat(format as GameFormat);
      setFormatInfo(getGameFormatInfo(format as GameFormat));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description) {
      setFormError('Title and description are required');
      return;
    }

    if (title.length < 3) {
      setFormError('Game title must be at least 3 characters');
      return;
    }

    if (description.length < 10) {
      setFormError('Description must be at least 10 characters');
      return;
    }

    if (!thumbnail) {
      setFormError('Game thumbnail is required');
      return;
    }

    if (!gameFile) {
      setFormError('Game file is required');
      return;
    }

    if (isUnsupportedArchiveFileName(gameFile.name)) {
      setFormError(archiveRejectionMessage);
      return;
    }

    setIsSaving(true);
    setUploadStage('creating');
    let createdGameId: string | null = null;

    try {
      // Create game with basic info and detected format
      const gameData = {
        title,
        description,
        tags: formData.tags,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        gameFormat: detectedFormat,
        isWebBased: formatInfo.isWebBased,
        supportedEmulator: formatInfo.supportedEmulator,
      };

      const createdGame = await createGame(gameData, { silent: true });
      createdGameId = createdGame?._id || createdGame?.id || null;

      if (!createdGameId) {
        throw new Error('Game record was created without a valid ID');
      }

      setUploadStage('thumbnail');
      const uploadedThumbnailGame = await uploadGameThumbnail(createdGameId, thumbnail, { silent: true });
      if (!uploadedThumbnailGame?.thumbnail) {
        throw new Error('Thumbnail upload did not complete successfully');
      }

      setUploadStage('file');
      const uploadedPayload = await uploadGameFile(createdGameId, gameFile, { silent: true });
      const uploadedGame = uploadedPayload?.game || uploadedPayload;
      if (!uploadedGame?.fileUrl) {
        throw new Error('Game file upload did not complete successfully');
      }

      setUploadStage('finalizing');
      try {
        await getProfile({ silent: true });
      } catch (refreshError) {
        console.warn('Failed to refresh profile stats after upload:', refreshError);
      }

      success('Game uploaded successfully!');
      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push('/dashboard?section=games');
      }, 2000);
    } catch (err: unknown) {
      if (createdGameId) {
        try {
          await deleteGame(createdGameId, { silent: true });
        } catch (cleanupError) {
          console.error('Failed to rollback game after upload failure:', cleanupError);
          try {
            await apiClient.delete(`/games/${createdGameId}`);
          } catch (fallbackCleanupError) {
            console.error('Fallback rollback request failed:', fallbackCleanupError);
          }
        }
      }

      const errorMessage = getApiErrorMessage(err, 'Failed to upload game');
      setFormError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsSaving(false);
      setUploadStage('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-2">
            Upload Your Game
          </h1>
          <p className="text-lg text-gray-500">
            Share your creation with the AceArena community
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
              {getUploadStageMessage(uploadStage)}
              </span>
              <span>{getUploadProgress(uploadStage)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
                style={{ width: `${getUploadProgress(uploadStage)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-emerald-800">
              Upload in progress. Please keep this tab open until completion.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Game Title */}
          <Card className="p-6 border border-gray-200 bg-white text-black ring-0">
            <label className="block text-sm font-semibold text-black mb-2">
              Game Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your game title"
              required
              className={`w-full ${fieldClassName}`}
            />
          </Card>

          {/* Description */}
          <Card className="p-6 border border-gray-200 bg-white text-black ring-0">
            <label className="block text-sm font-semibold text-black mb-2">
              Description *
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your game in detail..."
              required
              rows={6}
              className={`w-full ${textAreaClassName}`}
            />
          </Card>

          {/* Tags */}
          <Card className="p-6 border border-gray-200 bg-white text-black ring-0">
            <label className="block text-sm font-semibold text-black mb-4">
              Tags
            </label>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags (e.g., Horror, Puzzle)"
                className={`flex-1 ${fieldClassName}`}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="px-6 border-gray-300 bg-white text-black hover:bg-gray-100 dark:border-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                Add Tag
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer group">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Pricing */}
          <Card className="p-6 border border-gray-200 bg-white text-black ring-0">
            <label className="block text-sm font-semibold text-black mb-4">
              Pricing
            </label>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={formData.isFree}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, isFree: true, price: '' }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-gray-700">
                  Free Game
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={!formData.isFree}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, isFree: false }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-gray-700">
                  Paid Game
                </span>
              </label>
              {!formData.isFree && (
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price (USD)"
                  step="0.01"
                  min="0.99"
                  required={!formData.isFree}
                  className={`ml-8 ${fieldClassName}`}
                />
              )}
            </div>
          </Card>

          {/* Thumbnail Upload */}
          <Card className="p-6 border border-gray-200 bg-white text-black ring-0">
            <label className="block text-sm font-semibold text-black mb-4">
              Game Thumbnail *
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="pointer-events-none">
                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              {thumbnail && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium text-green-600">
                    ✓ {thumbnail.name}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Game File Upload */}
          <Card className="p-6 border border-gray-200 bg-white text-black ring-0">
            <label className="block text-sm font-semibold text-black mb-4">
              Game File *
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".zip,.html,.htm,.exe,.dmg,.apk,.nes,.rom,.z64,.smc,.sfc"
                onChange={handleGameFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="pointer-events-none">
                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  ZIP (web build), HTML5, EXE, DMG, APK, ROM files up to 1GB
                </p>
              </div>
              {gameFile && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium text-green-600">
                    ✓ {gameFile.name}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Game Format Information */}
          {gameFile && (
            <Card className="p-6 border-l-4 border-black bg-gray-50 border border-gray-200 text-black ring-0">
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-black mb-2">
                    Game Format Detected
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-black text-white">{formatInfo.displayName}</Badge>
                      {canPlayInBrowser(detectedFormat) ? (
                        <Badge className="bg-green-600 text-white">Browser Compatible</Badge>
                      ) : (
                        <Badge className="bg-amber-600 text-white">Download Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      {formatInfo.description}
                    </p>
                    {detectedFormat === 'zip' && (
                      <p className="text-xs text-blue-700 font-medium">
                        Tip: If this archive is an exported web build with index.html and its asset files, AceArena will auto-enable browser play after upload.
                      </p>
                    )}
                    {canPlayInBrowser(detectedFormat) && (
                      <p className="text-xs text-green-700 font-medium">
                        ✓ Players can play this game directly in their browser!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
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
                  {getUploadStageMessage(uploadStage)} ({getUploadProgress(uploadStage)}%)
                </>
              ) : loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                  Preparing...
                </>
              ) : (
                'Upload Game'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
              className="flex-1 border-gray-400 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:opacity-100"
            >
              Cancel Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
