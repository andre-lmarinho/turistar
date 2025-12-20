'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

export async function removePlanMember(
  planId: string,
  userId: string,
  client: SupabaseClient<Database> = supabaseServer()
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
