// src/lib/supabaseServer.ts
import { cookies } from 'next/headers';
import {
  createServerActionClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Return a server-side Supabase client bound to Next.js cookies
export function supabaseServer(): SupabaseClient<Database> {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

// Return a server-side Supabase client for server actions bound to Next.js cookies
export function supabaseServerAction(): SupabaseClient<Database> {
  const cookieStore = cookies();
  return createServerActionClient<Database>({ cookies: () => cookieStore });
}
