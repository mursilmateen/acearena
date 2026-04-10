'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { upgradeToDeveLoper } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      upgradeToDeveLoper();
      setShowSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Upgrade failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">
            {showSuccess ? 'Success!' : 'Become a Developer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {showSuccess ? (
            <div className="text-center space-y-3">
              <p className="text-green-600 font-semibold">
                Your account is now a Developer account!
              </p>
              <p className="text-gray-600 text-sm">
                You can now upload games and assets to AceArena
              </p>
            </div>
          ) : (
            <>
              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                Upgrade your account to start uploading games and assets, and participate as a creator on AceArena.
              </p>

              {/* Benefits */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-black">Benefits:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-black font-semibold mt-0.5">•</span>
                    <span>Upload and publish games</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-semibold mt-0.5">•</span>
                    <span>Share and sell game assets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-semibold mt-0.5">•</span>
                    <span>Participate in game jams as a creator</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-semibold mt-0.5">•</span>
                    <span>Build your public portfolio</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Upgrading...' : 'Upgrade to Developer'}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
