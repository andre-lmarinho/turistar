'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

type PlanMemberTier = Database['public']['Enums']['plan_member_tier'];

export async function updatePlanMemberTier(
  planId: string,
  userId: string,
  tier: PlanMemberTier,
  client: SupabaseClient<Database> = supabaseServer()
): Promise<void> {
  const supabase = client;
  const { error } = await supabase.rpc('update_plan_member_tier', {
    _plan_id: planId,
    _user_id: userId,
    _tier: tier,
  });

  if (error) {
    throw error;
  }
}
