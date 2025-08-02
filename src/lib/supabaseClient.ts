// src/lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a browser-ready Supabase client for React components
export const supabase: SupabaseClient<Database> = createClientComponentClient<Database>();
