'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

export async function acceptPlanShareLink(
  token: string,
  client: SupabaseClient<Database> = supabaseServer()
): Promise<string> {
  const supabase = client;
  const { data, error } = await supabase.rpc('accept_plan_share_link', {
    _token: token,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Share link not accepted');
  }

  return data as string;
}
