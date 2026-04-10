'use client';

import { useStoreHydration } from '@/hooks/useStoreHydration';

interface StoreHydrationProviderProps {
  children: React.ReactNode;
}

export default function StoreHydrationProvider({ children }: StoreHydrationProviderProps) {
  useStoreHydration();
  return <>{children}</>;
}
