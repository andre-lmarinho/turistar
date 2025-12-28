'use server';

<<<<<<<< HEAD:src/features/app/planner/server/actions/plans/removePlanMember.ts
import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function removePlanMember(
  planId: string,
  userId: string,
  client: SupabaseClient = supabaseServer()
): Promise<void> {
  const supabase = client;
  const { error } = await supabase.rpc('remove_plan_member', {
    _plan_id: planId,
    _user_id: userId,
  });

  if (error) {
    throw error;
  }
}
========
export { removePlanMember } from '@/features/app/planner/server/actions/plans/removePlanMember';
>>>>>>>> origin/main:src/server/actions/plans/removePlanMember.ts
