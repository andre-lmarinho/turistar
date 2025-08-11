// src/shared/lib/supabaseService.ts

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/supabase';
import { env } from './env';
import { clientEnv } from './clientEnv';

/**
 * Supabase client using the service role key.
 * Bypasses RLS and should only be used on the server.
 */
export function supabaseService(): SupabaseClient<Database> {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createServerClient<Database>(clientEnv.NEXT_PUBLIC_SUPABASE_URL, key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
