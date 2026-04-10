'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

/**
 * Hook for handling global keyboard shortcuts
 * Registers shortcuts and provides centralized keyboard event handling
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const { keyboardShortcutsEnabled, comparisonGameIds } = useAppStore();
  const helpModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K or / for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // Find search input and focus it
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // ? for keyboard shortcuts help
      if (event.key === '?') {
        event.preventDefault();
        // Trigger help modal
        const helpEvent = new CustomEvent('openKeyboardHelpModal');
        window.dispatchEvent(helpEvent);
      }

      // C for comparison (if items in comparison)
      if (event.key === 'c' && comparisonGameIds.length > 0) {
        event.preventDefault();
        router.push('/games/compare');
      }

      // Escape to close modals
      if (event.key === 'Escape') {
        // Dispatch event for modals to listen to
        const closeEvent = new CustomEvent('closeModals');
        window.dispatchEvent(closeEvent);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keyboardShortcutsEnabled, comparisonGameIds, router]);
}

/**
 * List of available keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'Cmd/Ctrl + K', action: 'Focus search' },
  { key: '?', action: 'Show keyboard shortcuts help' },
  { key: 'C', action: 'Go to game comparison' },
  { key: 'Escape', action: 'Close modals' },
];
