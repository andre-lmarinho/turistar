'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function revokePlanShareLink(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<boolean> {
  const supabase = client;
  const { data, error } = await supabase.rpc('revoke_plan_share_link', {
    _plan_id: planId,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}
