// src/shared/components/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/shared/types/supabase';
import { clientEnv } from '@/shared/lib/clientEnv';

// Context
type Supabase = ReturnType<typeof createBrowserClient<Database>>;
const SupabaseContext = createContext<Supabase | null>(null);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(
    () =>
      createBrowserClient<Database>(
        clientEnv.NEXT_PUBLIC_SUPABASE_URL,
        clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
    []
  );

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}

// Hook
export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside <SupabaseProvider>');
  return ctx;
};
