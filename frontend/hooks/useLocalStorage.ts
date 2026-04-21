'use client';

import { useState, useCallback } from 'react';

/**
 * Generic localStorage hook with type safety
 * Automatically syncs with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((currentValue) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore = value instanceof Function ? value(currentValue) : value;

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }

        return valueToStore;
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
        return currentValue;
      }
    });
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for array operations in localStorage
 */
export function useLocalStorageArray<T>(key: string, initialValue: T[] = []): {
  items: T[];
  add: (item: T) => void;
  remove: (predicate: (item: T) => boolean) => void;
  clear: () => void;
  set: (items: T[]) => void;
} {
  const [items, setItems] = useLocalStorage<T[]>(key, initialValue);

  return {
    items,
    add: useCallback(
      (item: T) => {
        setItems((prev) => [...prev, item]);
      },
      [setItems]
    ),
    remove: useCallback(
      (predicate: (item: T) => boolean) => {
        setItems((prev) => prev.filter((item) => !predicate(item)));
      },
      [setItems]
    ),
    clear: useCallback(() => {
      setItems([]);
    }, [setItems]),
    set: useCallback(
      (newItems: T[]) => {
        setItems(newItems);
      },
      [setItems]
    ),
  };
}

/**
 * Helper function to clear all AceArena localStorage items
 */
export function clearAceArenaStorage() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith('ace_arena_'));
  keys.forEach((key) => localStorage.removeItem(key));
}
