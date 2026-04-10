'use client';

import React from 'react';
import ThemeProvider from './ThemeProvider';
import ToastProvider from './ToastProvider';
import StoreHydrationProvider from './StoreHydrationProvider';
import KeyboardShortcutsProvider from './KeyboardShortcutsProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <StoreHydrationProvider>
      <ThemeProvider>
        <KeyboardShortcutsProvider>
          <ToastProvider>{children}</ToastProvider>
        </KeyboardShortcutsProvider>
      </ThemeProvider>
    </StoreHydrationProvider>
  );
}
