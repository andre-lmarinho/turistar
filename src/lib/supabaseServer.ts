// src/lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Return a server-side Supabase client bound to Next.js cookies
export function supabaseServer(): SupabaseClient<Database> {
  return createServerClient<Database>({ cookies });
}
