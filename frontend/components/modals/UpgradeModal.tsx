'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useProfile } from '@/hooks/useBackendApi';
import { useToast } from '@/hooks/useToast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, setUser } = useAppStore();
  const { upgradeToDeveloper } = useProfile();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const data = await upgradeToDeveloper();
      const upgradedUser = data.user;

      if (upgradedUser) {
        setUser({
          id: upgradedUser.id,
          email: upgradedUser.email,
          username: upgradedUser.username,
          role: upgradedUser.role,
          bio: upgradedUser.bio || '',
          avatar: upgradedUser.avatar || undefined,
          joinedDate: user?.joinedDate || new Date(upgradedUser.createdAt),
          gamesUploaded: user?.gamesUploaded || 0,
          assetsUploaded: user?.assetsUploaded || 0,
          jamsJoined: user?.jamsJoined || 0,
          createdAt: new Date(upgradedUser.createdAt),
        });
      }

      success('Developer account activated');
      setShowSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setIsLoading(false);
      }, 1500);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === 'string'
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to upgrade account'
          : 'Failed to upgrade account';
      showError(message);
      setIsLoading(false);
      setShowSuccess(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-slate-900/35 flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full shadow-lg max-h-[calc(100vh-2rem)] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {showSuccess ? 'Success!' : 'Become a Developer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-slate-900 transition-colors"
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
                <p className="text-sm font-semibold text-slate-900">Benefits:</p>
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
    </div>,
    document.body
  );
}
