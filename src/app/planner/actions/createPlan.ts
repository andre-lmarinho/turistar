// src/app/planner/actions/createPlan.ts
'use server';

import { supabaseServer } from '@/lib/supabaseServer';

export async function createPlan(title: string) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { data, error } = await supabase
    .from('plans')
    .insert({ title, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}
