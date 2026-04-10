'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader, Volume2, VolumeX, Save, Upload, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  loadEmulatorLibrary,
  initializeNESEmulator,
  loadROMIntoEmulator,
  createSaveState,
  loadSaveState,
  SaveState,
} from '@/lib/emulatorUtils';
import { GameControllerHandler, GamepadInputState } from '@/lib/gameControllerHandler';

interface NESEmulatorProps {
  romUrl: string;
  gameTitle: string;
  gameId: string;
  onGamePause?: () => void;
}

export default function NESEmulator({
  romUrl,
  gameTitle,
  gameId,
  onGamePause,
}: NESEmulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<any>(null);
  const controllerRef = useRef<GameControllerHandler | null>(null);
  const gamepadConnectedRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [saveStates, setSaveStates] = useState<SaveState[]>([]);
  const [currentSlot, setCurrentSlot] = useState(1);
  const [gamepadStatus, setGamepadStatus] = useState('Disconnected');

  // Initialize emulator on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeEmulator = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load JSNES library
        await loadEmulatorLibrary('nesjs');

        if (!isMounted) return;

        // Get canvas element
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas element not found');
        }

        // Set canvas size
        canvas.width = 256;
        canvas.height = 240;

        // Initialize emulator
        const emulator = initializeNESEmulator(canvas);
        emulatorRef.current = emulator;

        // Load ROM
        await loadROMIntoEmulator(emulator, romUrl, 'nesjs');

        if (!isMounted) return;

        // Start emulation
        emulator.start();

        // Initialize game controller
        const controller = new GameControllerHandler((inputState) => {
          handleControllerInput(emulator, inputState);
        });

        controllerRef.current = controller;
        controller.startPolling();

        // Detect gamepad
        if (controller.detectGamepad()) {
          gamepadConnectedRef.current = true;
          setGamepadStatus('Connected');
        } else {
          setGamepadStatus('Use Keyboard (WASD, ZX)');
        }

        // Setup gamepad connect/disconnect listeners
        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize emulator');
          setIsLoading(false);
        }
      }
    };

    initializeEmulator();

    return () => {
      isMounted = false;
      if (controllerRef.current) {
        controllerRef.current.destroy();
      }
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [romUrl]);

  const handleControllerInput = (emulator: any, inputState: GamepadInputState): void => {
    if (!emulator) return;

    // Map input state to NES buttons
    // This would integrate with the actual emulator's input system
    // The JSNES library accepts input mapping
  };

  const handleGamepadConnected = () => {
    if (controllerRef.current?.detectGamepad()) {
      gamepadConnectedRef.current = true;
      setGamepadStatus('Connected');
    }
  };

  const handleGamepadDisconnected = () => {
    gamepadConnectedRef.current = false;
    setGamepadStatus('Disconnected - Use Keyboard');
  };

  const handleTogglePlayPause = (): void => {
    if (!emulatorRef.current) return;

    if (isRunning) {
      emulatorRef.current.stop?.();
      setIsRunning(false);
      onGamePause?.();
    } else {
      emulatorRef.current.start?.();
      setIsRunning(true);
    }
  };

  const handleToggleMute = (): void => {
    setIsMuted(!isMuted);
    // Would integrate with emulator's audio system
  };

  const handleSaveState = (): void => {
    if (!emulatorRef.current) return;

    try {
      const saveState = createSaveState(
        emulatorRef.current,
        gameId,
        currentSlot,
        `Save ${currentSlot} - ${new Date().toLocaleTimeString()}`
      );

      setSaveStates((prev) => {
        const newStates = prev.filter((s) => s.slot !== currentSlot);
        return [...newStates, saveState];
      });

      // Optionally save to backend
      saveSaveStateToBackend(saveState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save state');
    }
  };

  const handleLoadState = (slot: number): void => {
    if (!emulatorRef.current) return;

    const saveState = saveStates.find((s) => s.slot === slot);
    if (!saveState) return;

    try {
      loadSaveState(emulatorRef.current, saveState);
      setCurrentSlot(slot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load state');
    }
  };

  const saveSaveStateToBackend = async (saveState: SaveState): Promise<void> => {
    try {
      const response = await fetch(`/api/games/${gameId}/save-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveState),
      });

      if (!response.ok) {
        throw new Error('Failed to save state to backend');
      }
    } catch (err) {
      console.error('Backend save failed:', err);
      // Continue anyway - state is saved locally
    }
  };

  if (isLoading) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Initializing NES Emulator...</p>
          <p className="text-sm text-gray-400 mt-2">Loading ROM: {gameTitle}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="aspect-video bg-red-50 rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-800 font-semibold mb-2">Emulator Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-gray-600 text-xs mt-4">Try downloading the game instead</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Canvas Container */}
      <div className="bg-black rounded-lg overflow-hidden border-2 border-gray-700 flex items-center justify-center" style={{ aspectRatio: '256/240', maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-black"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleTogglePlayPause}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>

            <Button
              onClick={handleToggleMute}
              size="sm"
              variant="outline"
              className="text-gray-700 dark:text-gray-300"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Mute
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {gamepadStatus}
          </div>
        </div>

        {/* Save State Controls */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Save States
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((slot) => (
              <div key={slot} className="space-y-1">
                <Button
                  onClick={() => handleSaveState()}
                  disabled={currentSlot !== slot}
                  size="sm"
                  className={`w-full ${
                    currentSlot === slot ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600/50'
                  } text-white`}
                >
                  <Save className="w-3 h-3" />
                </Button>

                {saveStates.find((s) => s.slot === slot) && (
                  <Button
                    onClick={() => handleLoadState(slot)}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Load
                  </Button>
                )}

                <div className="text-xs text-gray-500 text-center">Slot {slot}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-semibold mb-1">Keyboard Controls:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p>↑↓←→ = Move</p>
              <p>Z = A Button</p>
            </div>
            <div>
              <p>X = B Button</p>
              <p>Enter = Start</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
