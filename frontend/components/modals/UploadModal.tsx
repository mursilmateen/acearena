'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, ChevronRight, Loader, Globe, Monitor, Smartphone } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAME_TYPES = [
  { id: 'web', label: 'Web/Browser', description: 'HTML5, WebGL, JavaScript games', icon: Globe },
  { id: 'desktop', label: 'Desktop', description: 'Windows, Mac, Linux', icon: Monitor },
  { id: 'mobile', label: 'Mobile', description: 'iOS, Android', icon: Smartphone },
];

const GAME_PLATFORMS = ['Unity', 'Unreal Engine', 'Godot', 'Custom HTML5', 'Phaser', 'Kaboom', 'Pixel.js', 'Three.js', 'Other'];
const GAME_CATEGORIES = ['Action', 'Adventure', 'Puzzle', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Horror', 'Educational', 'Casual'];
const GAME_RATINGS = [
  { id: 'e', label: 'Everyone (E)', age: '3+' },
  { id: 't', label: 'Teen (T)', age: '13+' },
  { id: 'm', label: 'Mature (M)', age: '17+' },
  { id: 'ao', label: 'Adults Only (AO)', age: '18+' },
];

const ASSET_TYPES = [
  { id: 'graphics', label: 'Graphics', subtypes: ['2D Art', 'Sprites', 'UI Kit', 'Tileset', 'Texture Pack'] },
  { id: 'audio', label: 'Audio', subtypes: ['Music', 'Sound Effects', 'Voice Pack'] },
  { id: 'models3d', label: '3D Models', subtypes: ['Characters', 'Props', 'Environment', 'Vehicles'] },
  { id: 'code', label: 'Code', subtypes: ['Scripts', 'Plugins', 'Libraries', 'Tools'] },
  { id: 'fonts', label: 'Fonts', subtypes: ['TTF', 'OTF', 'Web Fonts'] },
];

const ASSET_ENGINES = ['Unity', 'Unreal Engine', 'Godot', 'Game Maker', 'Construct', 'RPG Maker', 'Multiple Engines'];
const ASSET_LICENSES = ['Free', 'CC0', 'CC-BY', 'MIT', 'GPL', 'Commercial', 'Custom'];

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadType, setUploadType] = useState<'game' | 'asset' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Game specific
  const [gameType, setGameType] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [version, setVersion] = useState('1.0.0');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [requirementsGame, setRequirementsGame] = useState('');
  
  // Asset specific
  const [assetType, setAssetType] = useState<string>('');
  const [assetSubtype, setAssetSubtype] = useState<string>('');
  const [engineCompatibility, setEngineCompatibility] = useState<string>('');
  const [license, setLicense] = useState<string>('');
  const [requirementsAsset, setRequirementsAsset] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      setCurrentStep(1);
      setUploadType(null);
      setTitle('');
      setDescription('');
      setTags('');
      setPrice('');
      setFileName('');
      setIsSuccess(false);
      setGameType('');
      setPlatform('');
      setCategory('');
      setRating('');
      setVersion('1.0.0');
      setIsMultiplayer(false);
      setRequirementsGame('');
      setAssetType('');
      setAssetSubtype('');
      setEngineCompatibility('');
      setLicense('');
      setRequirementsAsset('');
      onClose();
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);

    // Auto close after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const isStep1Valid = uploadType !== null;
  const isStep2Valid = 
    title.trim() !== '' && 
    description.trim() !== '' &&
    (uploadType === 'game' ? gameType && platform && category : assetType && engineCompatibility && license);
  const isStep3Valid = fileName !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
      {/* Modal Container */}
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 opacity-100 max-h-[85vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-lg font-semibold text-black">Upload to AceArena</h1>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Success State */}
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Upload Completed!</h3>
                <p className="text-gray-600 text-center max-w-sm">
                  Your {uploadType} has been successfully uploaded to AceArena.
                </p>
              </div>
            ) : (
              <>
                {/* Progress Indicator */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4].map((step) => (
                      <React.Fragment key={step}>
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                            step <= currentStep
                              ? 'bg-black text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {step}
                        </div>
                        {step < 4 && (
                          <div
                            className={`flex-1 h-1 mx-1 rounded-full transition-all duration-200 ${
                              step < currentStep ? 'bg-black' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {['Select Type', 'Specifications', 'File Upload', 'Review'][currentStep - 1]}
                  </p>
                </div>

                {/* Step Content - Contained */}
                <div className="space-y-6">
                  {/* Step 1: Select Type */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-black">What do you want to upload?</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'game', label: 'Game', description: 'Upload a new game' },
                          { id: 'asset', label: 'Asset', description: 'Upload game assets' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setUploadType(option.id as 'game' | 'asset')}
                            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                              uploadType === option.id
                                ? 'border-black bg-black/5'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="text-base font-semibold text-black mb-1">{option.label}</div>
                            <div className="text-xs text-gray-600">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Basic Details & Specifications */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-black">Details & Specifications</h2>
                      
                      {/* Basic Info */}
                      <div className="space-y-4 pb-4 border-b border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">Title *</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={uploadType === 'game' ? 'Enter game title' : 'Enter asset name'}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">Description *</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your upload in detail..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">Tags</label>
                          <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. action, puzzle, adventure (comma separated)"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                      </div>

                      {/* Game Specific Fields */}
                      {uploadType === 'game' && (
                        <div className="space-y-4 pb-4 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900">Game Specifications *</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Type *</label>
                              <select
                                value={gameType}
                                onChange={(e) => setGameType(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select type...</option>
                                {GAME_TYPES.map((t) => (
                                  <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Platform/Engine *</label>
                              <select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select platform...</option>
                                {GAME_PLATFORMS.map((p) => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Category *</label>
                              <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select category...</option>
                                {GAME_CATEGORIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Rating</label>
                              <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select rating...</option>
                                {GAME_RATINGS.map((r) => (
                                  <option key={r.id} value={r.id}>{r.label} ({r.age})</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Version</label>
                              <input
                                type="text"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                placeholder="1.0.0"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isMultiplayer}
                                  onChange={(e) => setIsMultiplayer(e.target.checked)}
                                  className="w-4 h-4 accent-black"
                                />
                                <span className="text-sm font-medium text-black">Multiplayer</span>
                              </label>
                            </div>
                          </div>
                          {gameType !== 'web' && (
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">System Requirements</label>
                              <textarea
                                value={requirementsGame}
                                onChange={(e) => setRequirementsGame(e.target.value)}
                                placeholder="e.g. Windows 10+, 4GB RAM, 2GB storage"
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors resize-none"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Price</label>
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-2">$</span>
                              <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              />
                              <span className="text-xs text-gray-600 ml-2">(0 = Free)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Asset Specific Fields */}
                      {uploadType === 'asset' && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900">Asset Specifications *</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Asset Type *</label>
                              <select
                                value={assetType}
                                onChange={(e) => {
                                  setAssetType(e.target.value);
                                  setAssetSubtype('');
                                }}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select type...</option>
                                {ASSET_TYPES.map((t) => (
                                  <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            {assetType && (
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">Subtype</label>
                                <select
                                  value={assetSubtype}
                                  onChange={(e) => setAssetSubtype(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                                >
                                  <option value="">Select subtype...</option>
                                  {ASSET_TYPES.find(t => t.id === assetType)?.subtypes.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">Engine Compatibility *</label>
                              <select
                                value={engineCompatibility}
                                onChange={(e) => setEngineCompatibility(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select engine...</option>
                                {ASSET_ENGINES.map((e) => (
                                  <option key={e} value={e}>{e}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">License *</label>
                              <select
                                value={license}
                                onChange={(e) => setLicense(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              >
                                <option value="">Select license...</option>
                                {ASSET_LICENSES.map((l) => (
                                  <option key={l} value={l}>{l}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Requirements/Notes</label>
                            <textarea
                              value={requirementsAsset}
                              onChange={(e) => setRequirementsAsset(e.target.value)}
                              placeholder="e.g. Includes source files, documentation, etc."
                              rows={2}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Price</label>
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-2">$</span>
                              <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                              />
                              <span className="text-xs text-gray-600 ml-2">(0 = Free)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: File Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-black">Upload your {uploadType}</h2>
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-black">Drag and drop your file here</p>
                            <p className="text-xs text-gray-600 mt-1">or click to browse</p>
                          </div>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </label>
                      {fileName && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-black truncate">{fileName}</p>
                          <p className="text-xs text-gray-600 mt-1">Ready to upload</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-black">Review your upload</h2>
                      <div className="space-y-3 bg-gray-50 rounded-lg p-5 max-h-[400px] overflow-y-auto">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Type</p>
                            <p className="text-sm font-medium text-black capitalize mt-1">{uploadType}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Title</p>
                            <p className="text-sm font-medium text-black mt-1">{title || '-'}</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200" />
                        
                        {/* Description */}
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase">Description</p>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-3">{description || '-'}</p>
                        </div>
                        <div className="border-t border-gray-200" />

                        {/* Game Info */}
                        {uploadType === 'game' && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              {gameType && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Game Type</p>
                                  <p className="text-sm text-gray-700 mt-1">{GAME_TYPES.find(t => t.id === gameType)?.label}</p>
                                </div>
                              )}
                              {platform && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Platform</p>
                                  <p className="text-sm text-gray-700 mt-1">{platform}</p>
                                </div>
                              )}
                              {category && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Category</p>
                                  <p className="text-sm text-gray-700 mt-1">{category}</p>
                                </div>
                              )}
                              {rating && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Rating</p>
                                  <p className="text-sm text-gray-700 mt-1">{GAME_RATINGS.find(r => r.id === rating)?.label}</p>
                                </div>
                              )}
                            </div>
                            {version && (
                              <>
                                <div className="border-t border-gray-200" />
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Version</p>
                                  <p className="text-sm text-gray-700 mt-1">{version}</p>
                                </div>
                              </>
                            )}
                            {isMultiplayer && (
                              <>
                                <div className="border-t border-gray-200" />
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Features</p>
                                  <p className="text-sm text-gray-700 mt-1">✓ Multiplayer Support</p>
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {/* Asset Info */}
                        {uploadType === 'asset' && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              {assetType && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Asset Type</p>
                                  <p className="text-sm text-gray-700 mt-1">{ASSET_TYPES.find(t => t.id === assetType)?.label}</p>
                                </div>
                              )}
                              {assetSubtype && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Subtype</p>
                                  <p className="text-sm text-gray-700 mt-1">{assetSubtype}</p>
                                </div>
                              )}
                              {engineCompatibility && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">Engine</p>
                                  <p className="text-sm text-gray-700 mt-1">{engineCompatibility}</p>
                                </div>
                              )}
                              {license && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 uppercase">License</p>
                                  <p className="text-sm text-gray-700 mt-1">{license}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Tags */}
                        {tags && (
                          <>
                            <div className="border-t border-gray-200" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase">Tags</p>
                              <p className="text-sm text-gray-700 mt-1">{tags}</p>
                            </div>
                          </>
                        )}

                        {/* Price */}
                        {price && (
                          <>
                            <div className="border-t border-gray-200" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase">Price</p>
                              <p className="text-sm text-gray-700 mt-1">${price}</p>
                            </div>
                          </>
                        )}

                        {/* File */}
                        <div className="border-t border-gray-200" />
                        <div>
                          <p className="text-xs font-medium text-gray-600 uppercase">File</p>
                          <p className="text-sm text-gray-700 mt-1 truncate">{fileName || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer - Actions */}
        {!isSuccess && (
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !isStep1Valid) ||
                    (currentStep === 2 && !isStep2Valid) ||
                    (currentStep === 3 && !isStep3Valid)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
