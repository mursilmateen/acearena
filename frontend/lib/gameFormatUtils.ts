/**
 * Game Format Detection and Support Utilities
 */

export type GameFormat = 'html5' | 'webgl' | 'zip' | 'exe' | 'dmg' | 'apk' | 'nes' | 'snes' | 'other';
export type SupportedEmulator = 'nesjs' | 'snes9x' | 'dosbox' | 'none';

interface GameFormatInfo {
  format: GameFormat;
  isWebBased: boolean;
  supportedEmulator: SupportedEmulator;
  displayName: string;
  canPlayInBrowser: boolean;
  description: string;
}

const GAME_FORMAT_MAP: Record<GameFormat, GameFormatInfo> = {
  html5: {
    format: 'html5',
    isWebBased: true,
    supportedEmulator: 'none',
    displayName: 'HTML5',
    canPlayInBrowser: true,
    description: 'HTML5 game - plays directly in browser',
  },
  webgl: {
    format: 'webgl',
    isWebBased: true,
    supportedEmulator: 'none',
    displayName: 'WebGL',
    canPlayInBrowser: true,
    description: 'WebGL 3D game - plays directly in browser',
  },
  zip: {
    format: 'zip',
    isWebBased: false,
    supportedEmulator: 'none',
    displayName: 'ZIP Archive',
    canPlayInBrowser: false,
    description: 'Compressed game files - requires download and extraction',
  },
  exe: {
    format: 'exe',
    isWebBased: false,
    supportedEmulator: 'none',
    displayName: 'Windows Executable',
    canPlayInBrowser: false,
    description: 'Windows game - requires download and installation',
  },
  dmg: {
    format: 'dmg',
    isWebBased: false,
    supportedEmulator: 'none',
    displayName: 'macOS App',
    canPlayInBrowser: false,
    description: 'macOS game - requires download and installation',
  },
  apk: {
    format: 'apk',
    isWebBased: false,
    supportedEmulator: 'none',
    displayName: 'Android App',
    canPlayInBrowser: false,
    description: 'Android game - requires mobile device',
  },
  nes: {
    format: 'nes',
    isWebBased: false,
    supportedEmulator: 'nesjs',
    displayName: 'NES ROM',
    canPlayInBrowser: true,
    description: 'Classic NES game - plays via emulator in browser',
  },
  snes: {
    format: 'snes',
    isWebBased: false,
    supportedEmulator: 'snes9x',
    displayName: 'SNES ROM',
    canPlayInBrowser: true,
    description: 'Classic SNES game - plays via emulator in browser',
  },
  other: {
    format: 'other',
    isWebBased: false,
    supportedEmulator: 'none',
    displayName: 'Other Format',
    canPlayInBrowser: false,
    description: 'Download required - format not directly supported',
  },
};

/**
 * Detect game format from file extension
 */
export function detectGameFormat(filename: string): GameFormat {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const formatMap: Record<string, GameFormat> = {
    // Web-based
    html: 'html5',
    htm: 'html5',
    webgl: 'webgl',
    
    // Emulated systems
    nes: 'nes',
    rom: 'nes', // Default ROMs to NES
    z64: 'snes',
    smc: 'snes',
    sfc: 'snes',
    
    // Desktop
    zip: 'zip',
    rar: 'zip',
    '7z': 'zip',
    exe: 'exe',
    dmg: 'dmg',
    pkg: 'dmg',
    
    // Mobile
    apk: 'apk',
    ipa: 'apk',
  };

  return formatMap[ext] || 'other';
}

/**
 * Get format information
 */
export function getGameFormatInfo(format: GameFormat): GameFormatInfo {
  return GAME_FORMAT_MAP[format];
}

/**
 * Check if game can be played in browser
 */
export function canPlayInBrowser(format: GameFormat): boolean {
  return GAME_FORMAT_MAP[format].canPlayInBrowser;
}

/**
 * Get game's iframe source URL
 * Handles different embedded game formats
 */
export function getGameIframeUrl(fileUrl: string, format: GameFormat): string {
  const info = GAME_FORMAT_MAP[format];

  if (!info.canPlayInBrowser) {
    return '';
  }

  // For direct HTML5/WebGL games, embed the URL directly
  if (format === 'html5' || format === 'webgl') {
    return fileUrl;
  }

  // For emulated games, return the file URL
  // The emulator will load the ROM
  if (format === 'nes' || format === 'snes') {
    return fileUrl;
  }

  return '';
}

/**
 * Get emulator script imports needed for a game
 */
export function getEmulatorScripts(format: GameFormat): string[] {
  const info = GAME_FORMAT_MAP[format];

  if (info.supportedEmulator === 'nesjs') {
    return [
      'https://cdn.jsdelivr.net/npm/jsnes@1.1.6/dist/jsnes.min.js',
    ];
  }

  if (info.supportedEmulator === 'snes9x') {
    return [
      'https://cdn.jsdelivr.net/npm/snes9x@1.0.0/dist/snes9x.min.js',
    ];
  }

  if (info.supportedEmulator === 'dosbox') {
    return [
      'https://cdn.jsdelivr.net/npm/dosbox@1.0.0/dist/dosbox.min.js',
    ];
  }

  return [];
}

/**
 * Validate if file is allowed to upload
 */
export function isValidGameFile(filename: string): boolean {
  const format = detectGameFormat(filename);
  return format !== 'other' || filename.length > 0;
}

/**
 * Get all supported formats
 */
export function getAllSupportedFormats(): GameFormatInfo[] {
  return Object.values(GAME_FORMAT_MAP);
}

/**
 * Get browser-playable formats
 */
export function getBrowserPlayableFormats(): GameFormatInfo[] {
  return Object.values(GAME_FORMAT_MAP).filter(f => f.canPlayInBrowser);
}

/**
 * Get downloadable-only formats
 */
export function getDownloadOnlyFormats(): GameFormatInfo[] {
  return Object.values(GAME_FORMAT_MAP).filter(f => !f.canPlayInBrowser);
}
