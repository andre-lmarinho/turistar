// src/shared/types/supabase-mod.d.ts

// Supabase core
declare module '@supabase/supabase-js' {
  export interface SupabaseQueryBuilder {
    select: (...args: unknown[]) => SupabaseQueryBuilder;
    insert: (...args: unknown[]) => SupabaseQueryBuilder;
    upsert: (...args: unknown[]) => SupabaseQueryBuilder;
    update: (...args: unknown[]) => SupabaseQueryBuilder;
    eq: (...args: unknown[]) => SupabaseQueryBuilder;
    order: (...args: unknown[]) => SupabaseQueryBuilder;
    gt: (...args: unknown[]) => SupabaseQueryBuilder;
    single: () => Promise<{ data: unknown; error: unknown }>;
    maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
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
      getSession: () => Promise<{ data: { session: unknown | null } }>;
      getUser: () => Promise<{ data: { user: { id: string } | null } }>;
    };
  }
}
