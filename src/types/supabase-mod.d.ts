// src/types/supabase-mod.d.ts

// Supabase core
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
