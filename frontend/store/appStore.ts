import { create } from 'zustand';
import { User, AuthState, SearchFilters, SocialLinks, GameCollection, FilterPreset, UserAction, AppPreferences } from '@/types';

interface AppStore extends AuthState {
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, role?: 'player' | 'developer') => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  upgradeToDeveLoper: () => void;
  clearCorruptedData: () => void; // Add data cleanup function

  // Profile actions
  updateProfile: (updates: Partial<User>) => void;
  updateSocialLinks: (socialLinks: SocialLinks) => void;
  updateBio: (bio: string) => void;
  updateAvatar: (avatar: string) => void;

  // Search
  searchFilters: SearchFilters;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Feature: Favorites/Wishlist
  favoriteGameIds: string[];
  addFavorite: (gameId: string) => void;
  removeFavorite: (gameId: string) => void;
  isFavorited: (gameId: string) => boolean;

  // Feature: History
  recentSearches: string[];
  recentGameViews: string[];
  addRecentSearch: (query: string) => void;
  addRecentGameView: (gameId: string) => void;
  clearHistory: () => void;

  // Feature: Collections
  collections: GameCollection[];
  createCollection: (name: string, description?: string) => void;
  deleteCollection: (collectionId: string) => void;
  addToCollection: (collectionId: string, gameId: string) => void;
  removeFromCollection: (collectionId: string, gameId: string) => void;

  // Feature: Game Comparison
  comparisonGameIds: string[];
  addToComparison: (gameId: string) => void;
  removeFromComparison: (gameId: string) => void;
  clearComparison: () => void;
  isInComparison: (gameId: string) => boolean;

  // Feature: User Achievements
  unlockedAchievements: string[];
  unlockAchievement: (achievementId: string) => void;

  // Feature: App Preferences
  appPreferences: AppPreferences;
  updatePreferences: (updates: Partial<AppPreferences>) => void;

  // Feature: Analytics
  userActions: UserAction[];
  trackAction: (action: UserAction) => void;

  // Feature: Keyboard Shortcuts
  keyboardShortcutsEnabled: boolean;
  toggleKeyboardShortcuts: () => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  tags: [],
  priceRange: { min: 0, max: 100 },
  sortBy: 'newest',
};

const defaultPreferences: AppPreferences = {
  accentColor: '#a855f7',
  darkTheme: 'default',
  filterPresets: [],
  skipOnboarding: false,
  showKeyboardHints: true,
};

// Helper function to validate and clean user data
const validateUserData = (user: any): boolean => {
  return (
    user &&
    user.email &&
    user.username &&
    typeof user.username === 'string' &&
    user.username.trim().length > 0 &&
    user.password &&
    typeof user.password === 'string'
  );
};

// Helper function to get valid users from localStorage
const getValidUsers = (): any[] => {
  try {
    const storedUsers = localStorage.getItem('ace_arena_users');
    if (!storedUsers) return [];
    
    const users = JSON.parse(storedUsers);
    if (!Array.isArray(users)) return [];
    
    // Filter out corrupted entries
    return users.filter(validateUserData);
  } catch (error) {
    console.error('Error reading user data:', error);
    return [];
  }
};

export const useAppStore = create<AppStore>((set) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Auth actions
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { apiClient } = await import('@/lib/api');
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;
      
      // Save token
      localStorage.setItem('token', token);
      
      // Convert backend user to frontend user format
      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'player',
        bio: userData.bio || '',
        joinedDate: new Date(),
        gamesUploaded: 0,
        assetsUploaded: 0,
        jamsJoined: 0,
        createdAt: new Date(userData.createdAt),
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string, role: 'player' | 'developer' = 'player') => {
    set({ isLoading: true });
    try {
      const { apiClient } = await import('@/lib/api');
      const response = await apiClient.post('/auth/register', {
        email,
        username,
        password,
        role,
      });
      
      const { token, user: userData } = response.data.data;
      
      // Save token
      localStorage.setItem('token', token);
      
      // Convert backend user to frontend user format
      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'player',
        bio: userData.bio || '',
        joinedDate: new Date(),
        gamesUploaded: 0,
        assetsUploaded: 0,
        jamsJoined: 0,
        createdAt: new Date(userData.createdAt),
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  upgradeToDeveLoper: () => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, role: 'developer' as const };
        
        // Update localStorage
        try {
          const storedUsers = localStorage.getItem('ace_arena_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
          if (userIndex !== -1) {
            users[userIndex].role = 'developer';
            localStorage.setItem('ace_arena_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Failed to update localStorage:', error);
        }
        
        return {
          user: updatedUser,
        };
      }
      return state;
    });
  },

  // Profile actions
  updateProfile: (updates: Partial<User>) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...updates };
        
        // Update localStorage if user exists
        try {
          const storedUsers = localStorage.getItem('ace_arena_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
          if (userIndex !== -1) {
            users[userIndex] = {
              ...users[userIndex],
              ...updates,
            };
            localStorage.setItem('ace_arena_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Failed to update localStorage:', error);
        }
        
        return {
          user: updatedUser,
        };
      }
      return state;
    });
  },

  updateSocialLinks: (socialLinks: SocialLinks) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, socialLinks };
        
        // Update localStorage
        try {
          const storedUsers = localStorage.getItem('ace_arena_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
          if (userIndex !== -1) {
            users[userIndex].socialLinks = socialLinks;
            localStorage.setItem('ace_arena_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Failed to update localStorage:', error);
        }
        
        return {
          user: updatedUser,
        };
      }
      return state;
    });
  },

  updateBio: (bio: string) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, bio };
        
        // Update localStorage
        try {
          const storedUsers = localStorage.getItem('ace_arena_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
          if (userIndex !== -1) {
            users[userIndex].bio = bio;
            localStorage.setItem('ace_arena_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Failed to update localStorage:', error);
        }
        
        return {
          user: updatedUser,
        };
      }
      return state;
    });
  },

  updateAvatar: (avatar: string) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, avatar };
        
        // Update localStorage
        try {
          const storedUsers = localStorage.getItem('ace_arena_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
          if (userIndex !== -1) {
            users[userIndex].avatar = avatar;
            localStorage.setItem('ace_arena_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Failed to update localStorage:', error);
        }
        
        return {
          user: updatedUser,
        };
      }
      return state;
    });
  },

  // Search
  searchFilters: defaultFilters,
  updateSearchFilters: (filters: Partial<SearchFilters>) => {
    set((state) => ({
      searchFilters: {
        ...state.searchFilters,
        ...filters,
      },
    }));
  },

  resetSearchFilters: () => {
    set({ searchFilters: defaultFilters });
  },

  // Theme
  theme: 'dark',
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
  },

  // Feature: Favorites/Wishlist
  favoriteGameIds: [],
  addFavorite: (gameId: string) => {
    set((state) => {
      const newFavorites = [...new Set([...state.favoriteGameIds, gameId])];
      localStorage.setItem('ace_arena_favorites', JSON.stringify(newFavorites));
      return { favoriteGameIds: newFavorites };
    });
  },
  removeFavorite: (gameId: string) => {
    set((state) => {
      const newFavorites = state.favoriteGameIds.filter((id) => id !== gameId);
      localStorage.setItem('ace_arena_favorites', JSON.stringify(newFavorites));
      return { favoriteGameIds: newFavorites };
    });
  },
  isFavorited: (gameId: string) => {
    const state = (create as any).getState?.() || {};
    return state.favoriteGameIds?.includes(gameId) || false;
  },

  // Feature: History
  recentSearches: [],
  recentGameViews: [],
  addRecentSearch: (query: string) => {
    set((state) => {
      const filtered = state.recentSearches.filter((q) => q !== query);
      const newSearches = [query, ...filtered].slice(0, 10);
      localStorage.setItem('ace_arena_recent_searches', JSON.stringify(newSearches));
      return { recentSearches: newSearches };
    });
  },
  addRecentGameView: (gameId: string) => {
    set((state) => {
      const filtered = state.recentGameViews.filter((id) => id !== gameId);
      const newViews = [gameId, ...filtered].slice(0, 10);
      localStorage.setItem('ace_arena_recent_games', JSON.stringify(newViews));
      return { recentGameViews: newViews };
    });
  },
  clearHistory: () => {
    localStorage.removeItem('ace_arena_recent_searches');
    localStorage.removeItem('ace_arena_recent_games');
    set({ recentSearches: [], recentGameViews: [] });
  },

  // Feature: Collections
  collections: [],
  createCollection: (name: string, description?: string) => {
    set((state) => {
      const newCollection: GameCollection = {
        id: Date.now().toString(),
        name,
        description,
        gameIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newCollections = [...state.collections, newCollection];
      localStorage.setItem('ace_arena_collections', JSON.stringify(newCollections));
      return { collections: newCollections };
    });
  },
  deleteCollection: (collectionId: string) => {
    set((state) => {
      const newCollections = state.collections.filter((c) => c.id !== collectionId);
      localStorage.setItem('ace_arena_collections', JSON.stringify(newCollections));
      return { collections: newCollections };
    });
  },
  addToCollection: (collectionId: string, gameId: string) => {
    set((state) => {
      const newCollections = state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              gameIds: [...new Set([...c.gameIds, gameId])],
              updatedAt: new Date(),
            }
          : c
      );
      localStorage.setItem('ace_arena_collections', JSON.stringify(newCollections));
      return { collections: newCollections };
    });
  },
  removeFromCollection: (collectionId: string, gameId: string) => {
    set((state) => {
      const newCollections = state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              gameIds: c.gameIds.filter((id) => id !== gameId),
              updatedAt: new Date(),
            }
          : c
      );
      localStorage.setItem('ace_arena_collections', JSON.stringify(newCollections));
      return { collections: newCollections };
    });
  },

  // Feature: Game Comparison
  comparisonGameIds: [],
  addToComparison: (gameId: string) => {
    set((state) => {
      const newComparison = state.comparisonGameIds.includes(gameId)
        ? state.comparisonGameIds
        : [...state.comparisonGameIds, gameId].slice(0, 3);
      localStorage.setItem('ace_arena_comparison', JSON.stringify(newComparison));
      return { comparisonGameIds: newComparison };
    });
  },
  removeFromComparison: (gameId: string) => {
    set((state) => {
      const newComparison = state.comparisonGameIds.filter((id) => id !== gameId);
      localStorage.setItem('ace_arena_comparison', JSON.stringify(newComparison));
      return { comparisonGameIds: newComparison };
    });
  },
  clearComparison: () => {
    localStorage.removeItem('ace_arena_comparison');
    set({ comparisonGameIds: [] });
  },
  isInComparison: (gameId: string) => {
    const state = (create as any).getState?.() || {};
    return state.comparisonGameIds?.includes(gameId) || false;
  },

  // Feature: User Achievements
  unlockedAchievements: [],
  unlockAchievement: (achievementId: string) => {
    set((state) => {
      const newAchievements = [...new Set([...state.unlockedAchievements, achievementId])];
      localStorage.setItem('ace_arena_achievements', JSON.stringify(newAchievements));
      return { unlockedAchievements: newAchievements };
    });
  },

  // Feature: App Preferences
  appPreferences: defaultPreferences,
  updatePreferences: (updates: Partial<AppPreferences>) => {
    set((state) => {
      const newPreferences = { ...state.appPreferences, ...updates };
      localStorage.setItem('ace_arena_preferences', JSON.stringify(newPreferences));
      return { appPreferences: newPreferences };
    });
  },

  // Feature: Analytics
  userActions: [],
  trackAction: (action: UserAction) => {
    set((state) => {
      const newActions = [...state.userActions, action].slice(-100);
      localStorage.setItem('ace_arena_actions', JSON.stringify(newActions));
      return { userActions: newActions };
    });
  },

  // Feature: Keyboard Shortcuts
  keyboardShortcutsEnabled: true,
  toggleKeyboardShortcuts: () => {
    set((state) => {
      const newValue = !state.keyboardShortcutsEnabled;
      localStorage.setItem('ace_arena_keyboard_shortcuts', JSON.stringify(newValue));
      return { keyboardShortcutsEnabled: newValue };
    });
  },

  // Data cleanup
  clearCorruptedData: () => {
    try {
      localStorage.removeItem('ace_arena_users');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
}));
