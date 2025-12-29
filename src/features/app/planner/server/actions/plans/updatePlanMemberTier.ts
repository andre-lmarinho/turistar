'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { updatePlanMemberTier as updatePlanMemberTierRpc } from '@/features/app/planner/server/repositories/PlanMembersRepository';
import { formatSupabaseError } from '@/shared/lib/supabaseErrors';
import { supabaseServer } from '@/shared/lib/supabaseServer';

type PlanMemberTier = 'admin' | 'member';

export async function updatePlanMemberTier(
  planId: string,
  userId: string,
  tier: PlanMemberTier,
  client: SupabaseClient = supabaseServer()
): Promise<void> {
  const supabase = client;
  const { error } = await updatePlanMemberTierRpc(planId, userId, tier, {
    client: supabase,
  });

  if (error) {
    throw formatSupabaseError({
      operation: 'updatePlanMemberTier',
      identifiers: { planId, userId, tier },
      error,
    });
  }
}
