import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/supabase';
import { clientEnv } from './clientEnv';

const isE2E = process.env.NEXT_PUBLIC_E2E === '1';

type SupabaseMockModule = typeof import('../../../tests/e2e/mocks/supabase');

function getE2ESupabaseClient(): SupabaseClient<Database> {
  const { getSupabaseMock } = require('../../../tests/e2e/mocks/supabase') as SupabaseMockModule;
  return getSupabaseMock();
}

export function supabaseServer() {
  if (isE2E) {
    return getE2ESupabaseClient();
  }
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
