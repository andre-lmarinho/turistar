'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

export async function updatePlanTitle(
  planId: string,
  editToken: string,
  newTitle: string,
  client: SupabaseClient<Database> = supabaseServer()
) {
  const supabase = client;
  const { error } = await supabase.rpc('update_plan_title', {
    _plan_id: planId,
    _edit_token: editToken,
    _new_title: newTitle,
  });
  if (error) throw error;
}
