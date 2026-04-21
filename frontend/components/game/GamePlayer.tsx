'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Download, Maximize2, Loader, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NESEmulator from '@/components/emulator/NESEmulator';
import SNESEmulator from '@/components/emulator/SNESEmulator';
import {
  GameFormat,
  getGameFormatInfo,
  canPlayInBrowser,
  getGameIframeUrl,
} from '@/lib/gameFormatUtils';

interface GamePlayerProps {
  gameId: string;
  gameTitle: string;
  fileUrl: string;
  gameFormat: GameFormat;
  onDownload?: () => void;
}

export default function GamePlayer({
  gameId,
  gameTitle,
  fileUrl,
  gameFormat,
  onDownload,
}: GamePlayerProps) {
  const router = useRouter();
  const canPlay = canPlayInBrowser(gameFormat);
  const isIframeGame = canPlay && (gameFormat === 'html5' || gameFormat === 'webgl');
  const formatInfo = getGameFormatInfo(gameFormat);
  const iframeUrl = getGameIframeUrl(fileUrl, gameFormat);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(isIframeGame);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isIframeGame) {
      return;
    }

    setIsLoading(true);
    setError(null);
  }, [isIframeGame, iframeUrl]);

  useEffect(() => {
    if (!isIframeGame || !isLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
      setError('Game is taking too long to load. The build may be missing files or inaccessible.');
    }, 15000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isIframeGame, isLoading]);

  // HTML5/WebGL Games - Direct Iframe
  if (isIframeGame) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <Loader className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        <iframe
          key={gameId}
          src={iframeUrl}
          title={gameTitle}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError('Failed to load game. The game file may be invalid or inaccessible.');
          }}
        />

        {!isFullscreen && (
          <Button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
            size="sm"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}

        {isFullscreen && (
          <Button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded"
            size="sm"
          >
            Exit Fullscreen
          </Button>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mb-2 mx-auto" />
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Emulated Games (NES, SNES, etc.)
  if (canPlay && gameFormat === 'nes') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={() => router.back()}
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h3 className="text-lg font-semibold text-gray-900">{gameTitle} (NES)</h3>
        </div>
        <NESEmulator
          romUrl={fileUrl}
          gameTitle={gameTitle}
          gameId={gameId}
          onGamePause={() => console.log('Game paused')}
        />
      </div>
    );
  }

  if (canPlay && gameFormat === 'snes') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={() => router.back()}
            size="sm"
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h3 className="text-lg font-semibold text-gray-900">{gameTitle} (SNES)</h3>
        </div>
        <SNESEmulator
          romUrl={fileUrl}
          gameTitle={gameTitle}
          gameId={gameId}
          onGamePause={() => console.log('Game paused')}
        />
      </div>
    );
  }

  // Non-playable in browser - Download option
  return (
    <Card className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
      <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />

      <h3 className="text-2xl font-bold text-gray-900 mb-2">Download Required</h3>

      <div className="max-w-md mx-auto mb-8">
        <p className="text-gray-600 mb-4">
          This is a <span className="font-semibold">{formatInfo.displayName}</span> game and requires download to play.
        </p>
        <p className="text-sm text-gray-500">{formatInfo.description}</p>
        {gameFormat === 'zip' && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            To enable in-browser play, upload an exported web build archive that includes index.html and all build assets.
          </p>
        )}
      </div>

      <div className="space-y-2 w-full max-w-sm">
        <Button
          onClick={onDownload}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download {gameTitle}
        </Button>

        <div className="text-xs text-gray-500 pt-4">
          <p className="font-semibold mb-1">System Requirements:</p>
          <ul className="text-left space-y-1">
            <li>• Platform: {formatInfo.displayName}</li>
            <li>• Installation required</li>
            <li>• Check system compatibility before download</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
