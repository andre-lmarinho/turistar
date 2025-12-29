'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { leavePlan as leavePlanRpc } from '@/features/app/planner/server/repositories/PlanMembersRepository';
import { formatSupabaseError } from '@/features/app/planner/services/supabase/supabaseErrors';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function leavePlan(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<void> {
  const supabase = client;
  const { error } = await leavePlanRpc(planId, { client: supabase });

  if (error) {
    throw formatSupabaseError({
      operation: 'leavePlan',
      identifiers: { planId },
      error,
    });
  }
}
