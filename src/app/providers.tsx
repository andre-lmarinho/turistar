'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

import { createSupabaseBrowserClient } from '@/shared/lib/supabaseClient';
import { clientEnv } from '@/shared/lib/clientEnv';

function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createSupabaseBrowserClient());

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      // Keep server-side Supabase session cookies in sync with the client session.
      void fetch('/auth/callback', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  return <SessionContextProvider supabaseClient={supabaseClient}>{children}</SessionContextProvider>;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
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
