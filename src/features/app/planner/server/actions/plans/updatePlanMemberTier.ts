'use server';

<<<<<<<< HEAD:src/features/app/planner/server/actions/plans/updatePlanMemberTier.ts
import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';

type PlanMemberTier = 'admin' | 'member';

export async function updatePlanMemberTier(
  planId: string,
  userId: string,
  tier: PlanMemberTier,
  client: SupabaseClient = supabaseServer()
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
========
export { updatePlanMemberTier } from '@/features/app/planner/server/actions/plans/updatePlanMemberTier';
>>>>>>>> origin/main:src/server/actions/plans/updatePlanMemberTier.ts
