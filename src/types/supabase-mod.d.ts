declare module '@supabase/supabase-js' {
  export interface SupabaseQueryBuilder {
    select: (...args: unknown[]) => SupabaseQueryBuilder;
    insert: (...args: unknown[]) => SupabaseQueryBuilder;
    upsert: (...args: unknown[]) => SupabaseQueryBuilder;
    update: (...args: unknown[]) => SupabaseQueryBuilder;
    eq: (...args: unknown[]) => SupabaseQueryBuilder;
    order: (...args: unknown[]) => SupabaseQueryBuilder;
    single: () => Promise<{ data: unknown; error: unknown }>;
  }

  export interface SupabaseClient<_DB = unknown> {
    readonly _database?: _DB;
    from: (...args: unknown[]) => SupabaseQueryBuilder;
    auth: {
      getSession: () => Promise<{ data: { session: unknown | null } }>;
      getUser: () => Promise<{ data: { user: { id: string } | null } }>;
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
  export const createMiddlewareClient: (opts: unknown) => SupabaseClient<Database>;
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
