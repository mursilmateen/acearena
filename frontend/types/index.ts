export interface Game {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  price: number;
  isFree?: boolean;
  thumbnail: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  downloadUrl?: string;
  galleryImages?: string[];
  fileType?: string;
  author?: string;
  authorId?: string;
  createdBy?:
    | string
    | {
        _id?: string;
        id?: string;
        username?: string;
        avatar?: string;
      };
  createdAt?: Date;
  updatedAt?: Date;
  downloads?: number;
  rating?: number;
  reviews?: number;
  gameFormat?: 'html5' | 'webgl' | 'zip' | 'exe' | 'dmg' | 'apk' | 'nes' | 'snes' | 'other';
  isWebBased?: boolean;
  supportedEmulator?: 'nesjs' | 'snes9x' | 'dosbox' | 'none';
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'player' | 'developer';
  bio?: string;
  joinedDate?: Date;
  socialLinks?: SocialLinks;
  gamesUploaded?: number;
  assetsUploaded?: number;
  jamsJoined?: number;
  recentGames?: string[];
  createdAt: Date;
}

export interface UserProfile extends User {
  editMode?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SearchFilters {
  query: string;
  tags: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'newest' | 'popular' | 'trending' | 'rating';
}

// Feature: Collections/Playlists
export interface GameCollection {
  id: string;
  name: string;
  description?: string;
  gameIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
}

// Feature: Filter Presets
export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<SearchFilters>;
  icon?: string;
}

// Feature: User Achievements/Badges
export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

// Feature: User Actions (for analytics)
export interface UserAction {
  id: string;
  type: 'game_view' | 'game_favorite' | 'game_download' | 'search' | 'filter' | 'collection_create' | 'profile_view';
  targetId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Feature: Comparison Data
export interface GameComparison {
  gameIds: string[];
  createdAt: Date;
}

// Feature: App Preferences
export interface AppPreferences {
  accentColor: string;
  darkTheme: 'pure-black' | 'dark-gray' | 'default';
  filterPresets: FilterPreset[];
  skipOnboarding?: boolean;
  showKeyboardHints?: boolean;
}
