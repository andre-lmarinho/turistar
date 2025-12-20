'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

type PlanMemberTier = Database['public']['Enums']['plan_member_tier'];

type AddPlanMemberRow = {
  user_id: string;
  tier: PlanMemberTier;
};

export type AddPlanMemberResult = {
  userId: string;
  tier: PlanMemberTier;
};

export async function addPlanMemberByEmail(
  planId: string,
  email: string,
  tier: PlanMemberTier,
  client: SupabaseClient<Database> = supabaseServer()
): Promise<AddPlanMemberResult> {
  const supabase = client;
  const { data, error } = await supabase.rpc('add_plan_member_by_email', {
    _plan_id: planId,
    _email: email,
    _tier: tier,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? (data[0] as AddPlanMemberRow | undefined) : null;

  if (!row) {
    throw new Error('No member returned');
  }

  return { userId: row.user_id, tier: row.tier };
}
