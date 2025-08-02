// src/app/planner/actions/createPlan.ts
'use server';

import { eachDayOfInterval } from 'date-fns';
import { supabaseServer } from '@/lib/supabaseServer';
import { buildInitialDays } from '@/utils';

export async function createPlan(dest: string, start: string, end: string) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert({ title: dest, user_id: user.id })
    .select()
    .single();
  if (planError) throw planError;

  const tripDays = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
  const days = buildInitialDays(tripDays);
  if (days.length) {
    const scaffold = days.map((d, idx) => ({
      id: d.id,
      plan_id: plan.id,
      date: d.id,
      position: idx,
    }));
    const { error: daysError } = await supabase.from('plan_days').insert(scaffold);
    if (daysError) throw daysError;
  }

  return { id: plan.id };
}
