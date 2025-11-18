/* eslint-disable @typescript-eslint/no-explicit-any */
// Lightweight Supabase typings used for tests and server actions.
declare module '@supabase/supabase-js' {
  export type AuthChangeEvent =
    | 'INITIAL_SESSION'
    | 'SIGNED_IN'
    | 'SIGNED_OUT'
    | 'TOKEN_REFRESHED'
    | 'USER_UPDATED'
    | 'PASSWORD_RECOVERY';

  export interface SupabaseAuthSubscription {
    unsubscribe: () => void;
  }

  export interface SupabaseSessionUser {
    id: string;
    email?: string | null;
  }

  export interface Session {
    access_token: string | null;
    refresh_token: string | null;
    expires_at: number | null;
    user: SupabaseSessionUser | null;
  }

  export interface SupabaseQueryBuilder<TData = unknown> {
    select: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    insert: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    upsert: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    update: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    eq: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    gt: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    order: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    limit: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    single: () => Promise<{ data: any; error: unknown }>;
    maybeSingle: () => Promise<{ data: any; error: unknown }>;
  }

  export interface SupabaseRealtimeChannel {
    on: (...args: unknown[]) => SupabaseRealtimeChannel;
    subscribe: () => SupabaseRealtimeChannel;
    unsubscribe: () => void;
  }

  export interface SupabaseClient<_DB = unknown> {
    readonly _database?: _DB;
    from: (...args: unknown[]) => SupabaseQueryBuilder;
    rpc: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
    channel: (...args: unknown[]) => SupabaseRealtimeChannel;
    auth: {
      getSession: () => Promise<{ data: { session: Session | null }; error: unknown }>;
      getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }>;
      signInWithPassword: (
        credentials: { email: string; password: string }
      ) => Promise<{ data: unknown; error: Error | null }>;
      signUp: (
        credentials: { email: string; password: string }
      ) => Promise<{ data: unknown; error: Error | null }>;
      onAuthStateChange: (
        callback: (event: AuthChangeEvent, session: Session | null) => void
      ) => { data: { subscription: SupabaseAuthSubscription } };
      setSession: (session: Session) => Promise<{ data: { session: Session | null }; error: unknown }>;
      signOut: () => Promise<{ error: unknown | null }>;
    };
  }
}
