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
  return createServerComponentClient<Database>({ cookies });
}

// Return a server-side Supabase client for server actions bound to Next.js cookies
export function supabaseServerAction(): SupabaseClient<Database> {
  return createServerActionClient<Database>({ cookies });
}
