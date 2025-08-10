// src/shared/lib/supabaseClient.ts

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/supabase';
import { clientEnv } from './clientEnv';

// Create a browser-ready Supabase client for React components
export const supabase: SupabaseClient<Database> = createBrowserClient<Database>(
  clientEnv.NEXT_PUBLIC_SUPABASE_URL,
  clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
