/**
 * Emulator Utilities
 * Handles emulator library initialization and ROM loading
 */

declare global {
  interface Window {
    JSNES: any;
    SNES: any;
  }
}

export interface EmulatorState {
  isRunning: boolean;
  isPaused: boolean;
  currentFrame: number;
  fps: number;
  volume: number;
}

export interface SaveState {
  id: string;
  gameId: string;
  timestamp: number;
  slot: number;
  data: string; // Base64 encoded state
  description?: string;
}

/**
 * Load emulator library dynamically
 */
export async function loadEmulatorLibrary(
  emulatorType: 'nesjs' | 'snes9x'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;

    if (emulatorType === 'nesjs') {
      script.src = 'https://cdn.jsdelivr.net/npm/jsnes@1.1.6/dist/jsnes.min.js';
    } else if (emulatorType === 'snes9x') {
      script.src = 'https://cdn.jsdelivr.net/npm/snes9x-js@1.0.0/dist/snes9x.min.js';
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${emulatorType} library`));

    document.head.appendChild(script);
  });
}

/**
 * Initialize NES emulator
 */
export function initializeNESEmulator(canvas: HTMLCanvasElement): any {
  if (!window.JSNES) {
    throw new Error('JSNES library not loaded');
  }

  const emulator = new window.JSNES({
    onFrame: (frameBuffer: Uint8Array) => {
      // Frame rendering is handled by the library
    },
    onAudioSample: (l: number, r: number) => {
      // Audio handling for future enhancement
    },
  });

  // Set canvas for rendering
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  emulator.setCanvas(canvas);
  return emulator;
}

/**
 * Initialize SNES emulator
 */
export function initializeSNESEmulator(canvas: HTMLCanvasElement): any {
  if (!window.SNES) {
    throw new Error('SNES9x library not loaded');
  }

  const emulator = new window.SNES({
    canvas: canvas,
    autoStart: true,
  });

  return emulator;
}

/**
 * Load ROM file into emulator
 */
export async function loadROMIntoEmulator(
  emulator: any,
  romUrl: string,
  emulatorType: 'nesjs' | 'snes9x'
): Promise<void> {
  try {
    const response = await fetch(romUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ROM: ${response.statusText}`);
    }

    const romData = await response.arrayBuffer();
    const romBytes = new Uint8Array(romData);

    if (emulatorType === 'nesjs') {
      emulator.loadRom(romBytes);
    } else if (emulatorType === 'snes9x') {
      emulator.loadRom(romBytes);
    }
  } catch (error) {
    throw new Error(`Failed to load ROM: ${error}`);
  }
}

/**
 * Create a save state from emulator
 */
export function createSaveState(
  emulator: any,
  gameId: string,
  slot: number,
  description?: string
): SaveState {
  try {
    // Get emulator state (varies by emulator type)
    const stateData = emulator.getState?.() || emulator.exportState?.();

    if (!stateData) {
      throw new Error('Emulator does not support state export');
    }

    // Convert to base64 for storage
    const base64Data = btoa(JSON.stringify(stateData));

    return {
      id: `${gameId}_slot_${slot}_${Date.now()}`,
      gameId,
      timestamp: Date.now(),
      slot,
      data: base64Data,
      description,
    };
  } catch (error) {
    throw new Error(`Failed to create save state: ${error}`);
  }
}

/**
 * Load a save state into emulator
 */
export function loadSaveState(emulator: any, saveState: SaveState): void {
  try {
    const stateData = JSON.parse(atob(saveState.data));

    if (emulator.setState) {
      emulator.setState(stateData);
    } else if (emulator.importState) {
      emulator.importState(stateData);
    } else {
      throw new Error('Emulator does not support state import');
    }
  } catch (error) {
    throw new Error(`Failed to load save state: ${error}`);
  }
}

/**
 * Get emulator FPS
 */
export function getEmulatorFPS(emulatorType: 'nesjs' | 'snes9x'): number {
  if (emulatorType === 'nesjs') {
    return 60; // NES runs at 60 FPS
  } else if (emulatorType === 'snes9x') {
    return 60; // SNES runs at 60 FPS (NTSC)
  }
  return 60;
}

/**
 * Validate ROM file before loading
 */
export function validateROMFile(
  filename: string,
  emulatorType: 'nesjs' | 'snes9x'
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (emulatorType === 'nesjs') {
    return ext === 'nes' || ext === 'rom';
  } else if (emulatorType === 'snes9x') {
    return ['snes', 'z64', 'smc', 'sfc'].includes(ext || '');
  }

  return false;
}

/**
 * Get emulator-specific button mapping
 */
export function getControllerMapping(emulatorType: 'nesjs' | 'snes9x') {
  const baseMapping = {
    up: ['ArrowUp', 'w', 'W'],
    down: ['ArrowDown', 's', 'S'],
    left: ['ArrowLeft', 'a', 'A'],
    right: ['ArrowRight', 'd', 'D'],
    start: ['Enter', ' '],
    select: ['Shift'],
  };

  if (emulatorType === 'nesjs') {
    return {
      ...baseMapping,
      a: ['z', 'Z'],
      b: ['x', 'X'],
    };
  } else if (emulatorType === 'snes9x') {
    return {
      ...baseMapping,
      a: ['z', 'Z'],
      b: ['x', 'X'],
      x: ['a', 'A'],
      y: ['s', 'S'],
      l: ['q', 'Q'],
      r: ['e', 'E'],
    };
  }

  return baseMapping;
}
