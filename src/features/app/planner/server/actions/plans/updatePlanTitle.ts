'use server';

<<<<<<<< HEAD:src/features/app/planner/server/actions/plans/updatePlanTitle.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function updatePlanTitle(
  planId: string,
  editToken: string,
  newTitle: string,
  client: SupabaseClient = supabaseServer()
) {
  const supabase = client;
  const { error } = await supabase.rpc('update_plan_title', {
    _plan_id: planId,
    _edit_token: editToken,
    _new_title: newTitle,
  });
  if (error) throw error;
}
========
export { updatePlanTitle } from '@/features/app/planner/server/actions/plans/updatePlanTitle';
>>>>>>>> origin/main:src/server/actions/plans/updatePlanTitle.ts
