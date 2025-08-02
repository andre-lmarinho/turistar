declare module '@supabase/supabase-js' {
  export interface SupabaseClient<_DB = unknown> {
    readonly _database?: _DB;
    from: (...args: unknown[]) => unknown;
    auth: {
      getSession: () => Promise<unknown>;
      getUser: () => Promise<unknown>;
    };
  }
}

declare module '@supabase/auth-helpers-nextjs' {
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from './supabase';
  export const createBrowserClient: (
    url: string,
    key: string,
    options?: unknown
  ) => SupabaseClient<Database>;
  export const createServerClient: (
    url: string,
    key: string,
    options?: unknown
  ) => SupabaseClient<Database>;
  export const createMiddlewareClient: (opts: unknown) => {
    auth: { getSession: () => Promise<unknown> };
    from: (...args: unknown[]) => unknown;
  };
}

declare module '@supabase/auth-helpers-react' {
  import type { ReactNode } from 'react';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from './supabase';
  interface ProviderProps {
    supabaseClient: SupabaseClient<Database>;
    children?: ReactNode;
  }
  export const SessionContextProvider: (props: ProviderProps) => ReactNode;
}
