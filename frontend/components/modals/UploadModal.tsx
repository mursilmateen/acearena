'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, Gamepad2, Package } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
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

  const goToUpload = (path: string) => {
    onClose();
    router.push(path);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-slate-900/35 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-900">Choose Upload Type</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => goToUpload('/upload')}
            className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-black text-white flex items-center justify-center">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Upload Game</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Publish a playable game build with metadata and thumbnail.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => goToUpload('/upload-asset')}
            className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-black text-white flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Upload Asset Package</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Upload one .zip bundle (sprites, audio, fonts, docs, license) like itch.io.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
