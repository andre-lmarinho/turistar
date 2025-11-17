'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/shared/lib/supabaseClient';
import { clientEnv } from '@/shared/lib/clientEnv';

function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createSupabaseBrowserClient());

  return <SessionContextProvider supabaseClient={supabaseClient}>{children}</SessionContextProvider>;
}

/**
 * Client-side context providers (React Query, Theme, etc.).
 * Keeps RootLayout as a Server Component.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // one QueryClient per browser tab
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SupabaseAuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {clientEnv.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SupabaseAuthProvider>
  );
}
