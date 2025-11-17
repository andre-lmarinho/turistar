import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import type { Database } from '@/shared/types/supabase';
import { clientEnv } from './clientEnv';

const isE2E = process.env.NEXT_PUBLIC_E2E === '1';

type SupabaseMockModule = typeof import('../../../tests/e2e/mocks/supabase');

function getE2ESupabaseClient(): SupabaseClient<Database> {
  const { getSupabaseMock } = require('../../../tests/e2e/mocks/supabase') as SupabaseMockModule;
  return getSupabaseMock();
}

export function createSupabaseServerClient(): SupabaseClient<Database> {
  if (isE2E) {
    return getE2ESupabaseClient();
  }

  const cookieStore = cookies();
  const headersList = headers();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
      headers: {
        get(key) {
          return headersList.get(key);
        },
      },
    }
  );
}

export function supabaseServer() {
  return createSupabaseServerClient();
}
