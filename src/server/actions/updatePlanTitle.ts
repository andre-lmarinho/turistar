// src/server/actions/updatePlanTitle.ts
'use server';

import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function updatePlanTitle(planId: string, editToken: string, newTitle: string) {
  const supabase = supabaseServer();
  const { error } = await supabase.rpc('update_plan_title', {
    _plan_id: planId,
    _edit_token: editToken,
    _new_title: newTitle,
  });
  if (error) throw error;
}
