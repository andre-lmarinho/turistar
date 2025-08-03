// src/__mocks__/supabaseSsr.ts
import type { SupabaseClient } from '@supabase/supabase-js';

function createBuilder(): any {
  const builder: any = {};

  ['select', 'insert', 'upsert', 'update', 'delete', 'eq', 'order'].forEach(
    (m) =>
      (builder[m] = (..._args: any[]) => {
        return builder;
      })
  );

  builder.single = () => Promise.resolve({ data: null, error: null });
  builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
  builder.returns = () => Promise.resolve({ data: null, error: null });

  return builder;
}

function createMockClient(): SupabaseClient<any> {
  return {
    from: () => createBuilder(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null } as any),
      getUser: () => Promise.resolve({ data: { user: null }, error: null } as any),
    },
  } as unknown as SupabaseClient<any>;
}

export const createBrowserClient = () => createMockClient();
export const createServerClient = () => createMockClient();
export const createMiddlewareClient = () => createMockClient();
