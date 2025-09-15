// src/shared/lib/supabaseServer.ts

import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/shared/types/supabase';
import { clientEnv } from './clientEnv';

export function supabaseServer() {
  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
