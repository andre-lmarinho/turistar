'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { removePlanMember as removePlanMemberRpc } from '@/features/app/planner/server/repositories/PlanMembersRepository';
import { formatSupabaseError } from '@/features/app/planner/services/supabase/supabaseErrors';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function removePlanMember(
  planId: string,
  userId: string,
  client: SupabaseClient = supabaseServer()
): Promise<void> {
  const supabase = client;
  const { error } = await removePlanMemberRpc(planId, userId, { client: supabase });

  if (error) {
    throw formatSupabaseError({
      operation: 'removePlanMember',
      identifiers: { planId, userId },
      error,
    });
  }
}
