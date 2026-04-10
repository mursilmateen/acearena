'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import apiClient from '@/lib/api';

/**
 * Hook to hydrate store from localStorage on app mount
 * Call this once in a client component (like in a provider)
 */
export function useStoreHydration() {
  useEffect(() => {
    // Load all persisted data from localStorage
    try {
      // First, restore user session if token exists
      const token = localStorage.getItem('token');
      if (token) {
        // Try to fetch the current user profile
        apiClient.get('/profile')
          .then((response) => {
            const userData = response.data.data;
            const user = {
              id: userData._id || userData.id,
              email: userData.email,
              username: userData.username,
              role: userData.role || 'player',
              bio: userData.bio || '',
              avatar: userData.avatar || null,
              joinedDate: new Date(userData.createdAt),
              gamesUploaded: 0,
              assetsUploaded: 0,
              jamsJoined: 0,
              createdAt: new Date(userData.createdAt),
            };
            useAppStore.setState({ user, isAuthenticated: true });
          })
          .catch((error) => {
            console.warn('Failed to restore user session:', error);
            // Token might be expired, clear it
            localStorage.removeItem('token');
          });
      }

      // Favorites
      const favorites = localStorage.getItem('ace_arena_favorites');
      if (favorites) {
        useAppStore.setState({ favoriteGameIds: JSON.parse(favorites) });
      }

      // Recent searches
      const recentSearches = localStorage.getItem('ace_arena_recent_searches');
      if (recentSearches) {
        useAppStore.setState({ recentSearches: JSON.parse(recentSearches) });
      }

      // Recent games
      const recentGames = localStorage.getItem('ace_arena_recent_games');
      if (recentGames) {
        useAppStore.setState({ recentGameViews: JSON.parse(recentGames) });
      }

      // Collections
      const collections = localStorage.getItem('ace_arena_collections');
      if (collections) {
        useAppStore.setState({ collections: JSON.parse(collections) });
      }

      // Comparison
      const comparison = localStorage.getItem('ace_arena_comparison');
      if (comparison) {
        useAppStore.setState({ comparisonGameIds: JSON.parse(comparison) });
      }

      // Achievements
      const achievements = localStorage.getItem('ace_arena_achievements');
      if (achievements) {
        useAppStore.setState({ unlockedAchievements: JSON.parse(achievements) });
      }

      // Preferences
      const preferences = localStorage.getItem('ace_arena_preferences');
      if (preferences) {
        useAppStore.setState({ appPreferences: JSON.parse(preferences) });
      }

      // Theme preference (if stored)
      const theme = localStorage.getItem('ace_arena_theme');
      if (theme) {
        useAppStore.setState({ theme: theme as 'light' | 'dark' });
      }

      // Keyboard shortcuts
      const keyboardShortcuts = localStorage.getItem('ace_arena_keyboard_shortcuts');
      if (keyboardShortcuts) {
        useAppStore.setState({ keyboardShortcutsEnabled: JSON.parse(keyboardShortcuts) });
      }

      // User actions
      const actions = localStorage.getItem('ace_arena_actions');
      if (actions) {
        useAppStore.setState({ userActions: JSON.parse(actions) });
      }
    } catch (error) {
      console.warn('Error hydrating store from localStorage:', error);
    }
  }, []);
}
