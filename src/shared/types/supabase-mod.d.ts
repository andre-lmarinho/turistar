// Lightweight Supabase typings used for tests and server actions.
declare module "@supabase/supabase-js" {
  export type AuthChangeEvent =
    | "INITIAL_SESSION"
    | "SIGNED_IN"
    | "SIGNED_OUT"
    | "TOKEN_REFRESHED"
    | "USER_UPDATED"
    | "PASSWORD_RECOVERY";

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

  export interface SupabaseQueryBuilder<TData = unknown> extends Promise<{ data: TData; error: unknown }> {
    select: <TSelect = TData>(...args: unknown[]) => SupabaseQueryBuilder<TSelect>;
    insert: <TInsert = TData>(...args: unknown[]) => SupabaseQueryBuilder<TInsert>;
    upsert: <TUpsert = TData>(...args: unknown[]) => SupabaseQueryBuilder<TUpsert>;
    update: <TUpdate = TData>(...args: unknown[]) => SupabaseQueryBuilder<TUpdate>;
    eq: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    gt: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    order: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    limit: (...args: unknown[]) => SupabaseQueryBuilder<TData>;
    single: () => Promise<{ data: TData; error: unknown }>;
    maybeSingle: () => Promise<{ data: TData | null; error: unknown }>;
  }

  export interface SupabaseRealtimeChannel {
    on: (...args: unknown[]) => SupabaseRealtimeChannel;
    subscribe: () => SupabaseRealtimeChannel;
    unsubscribe: () => void;
  }

  export interface SupabaseClient<_DB = unknown> {
    readonly _database?: _DB;
    from: <TData = unknown>(...args: unknown[]) => SupabaseQueryBuilder<TData>;
    rpc: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
    channel: (...args: unknown[]) => SupabaseRealtimeChannel;
    auth: {
      getSession: () => Promise<{ data: { session: Session | null }; error: unknown }>;
      getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }>;
      signInWithPassword: (credentials: {
        email: string;
        password: string;
      }) => Promise<{ data: unknown; error: Error | null }>;
      signUp: (credentials: {
        email: string;
        password: string;
        options?: {
          emailRedirectTo?: string;
          data?: Record<string, unknown>;
        };
      }) => Promise<{ data: unknown; error: Error | null }>;
      exchangeCodeForSession: (
        code: string
      ) => Promise<{ data: { session: Session | null }; error: Error | null }>;
      onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        data: { subscription: SupabaseAuthSubscription };
      };
      setSession: (session: Session) => Promise<{ data: { session: Session | null }; error: unknown }>;
      signOut: () => Promise<{ error: unknown | null }>;
    };
  }
}
