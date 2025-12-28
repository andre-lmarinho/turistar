'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function createPlanShareLink(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<string> {
  const supabase = client;
  const { data, error } = await supabase.rpc('create_plan_share_link', {
    _plan_id: planId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Share link not created');
  }

  return data as string;
}
