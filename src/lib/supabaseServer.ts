// src/lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export function supabaseServer() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies, schema: 'public' }
  );
}
