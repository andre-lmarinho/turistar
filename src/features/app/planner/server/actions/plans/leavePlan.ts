'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function leavePlan(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<void> {
  const supabase = client;
  const { error } = await supabase.rpc('leave_plan', {
    _plan_id: planId,
  });

  if (error) {
    throw error;
  }
}
