'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Upload, X, AlertCircle, Loader, Info } from 'lucide-react';
import { useGames } from '@/hooks/useBackendApi';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/useToast';
import UpgradeModal from '@/components/modals/UpgradeModal';
import { detectGameFormat, getGameFormatInfo, canPlayInBrowser, GameFormat } from '@/lib/gameFormatUtils';

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const { createGame, uploadGameThumbnail, uploadGameFile, loading } = useGames();
  const { success, error: errorToast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

    if (!formData.title || !formData.description) {
      setFormError('Title and description are required');
      return;
    }

    setIsSaving(true);

    try {
      // Create game with basic info and detected format
      const gameData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        gameFormat: detectedFormat,
        isWebBased: formatInfo.isWebBased,
        supportedEmulator: formatInfo.supportedEmulator,
      };

      const createdGame = await createGame(gameData);

      // Upload thumbnail if provided
      if (thumbnail && createdGame._id) {
        try {
          await uploadGameThumbnail(createdGame._id, thumbnail);
        } catch (err) {
          console.error('Thumbnail upload failed:', err);
          // Continue even if thumbnail fails
        }
      }

      // Upload game file if provided
      if (gameFile && createdGame._id) {
        try {
          await uploadGameFile(createdGame._id, gameFile);
        } catch (err) {
          console.error('Game file upload failed:', err);
          // Continue even if file fails
        }
      }

      success('Game uploaded successfully!');
      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push('/dashboard?section=games');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to upload game';
      setFormError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Upload Your Game
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Share your creation with the AceArena community
          </p>
        </div>

        {/* Success Message */}
        {formError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {formError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Game Title */}
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Game Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your game title"
              required
              className="w-full"
            />
          </Card>

          {/* Description */}
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Description *
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your game in detail..."
              required
              rows={6}
              className="w-full"
            />
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Tags
            </label>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags (e.g., Horror, Puzzle)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="px-6"
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
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
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
                <span className="text-slate-700 dark:text-slate-300">
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
                <span className="text-slate-700 dark:text-slate-300">
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
                  className="ml-8"
                />
              )}
            </div>
          </Card>

          {/* Thumbnail Upload */}
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Game Thumbnail *
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="pointer-events-none">
                <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              {thumbnail && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✓ {thumbnail.name}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Game File Upload */}
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Game File *
            </label>
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <input
                type="file"
                accept=".zip,.7z,.rar,.tar.gz,.html,.htm,.exe,.dmg,.apk,.nes,.rom,.z64,.smc,.sfc"
                onChange={handleGameFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="pointer-events-none">
                <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  ZIP, 7Z, RAR, TAR.GZ, HTML5, EXE, DMG, APK, ROM files up to 1GB
                </p>
              </div>
              {gameFile && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✓ {gameFile.name}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Game Format Information */}
          {gameFile && (
            <Card className="p-6 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Game Format Detected
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white">{formatInfo.displayName}</Badge>
                      {canPlayInBrowser(detectedFormat) ? (
                        <Badge className="bg-green-600 text-white">Browser Compatible</Badge>
                      ) : (
                        <Badge className="bg-amber-600 text-white">Download Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {formatInfo.description}
                    </p>
                    {canPlayInBrowser(detectedFormat) && (
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium">
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
              className="flex-1 bg-black hover:bg-gray-900 text-white font-semibold py-3 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                  Uploading...
                </>
              ) : (
                'Upload Game'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
