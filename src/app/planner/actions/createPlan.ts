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

  const { data: plans, error: planError } = (await supabase
    .from('plans')
    .insert({ title: dest, destination: dest, user_id: user.id })
    .select('id')) as unknown as {
    data: { id: string }[] | null;
    error: unknown;
  };
  if (planError || !plans?.length) throw planError || new Error('Failed to create plan');
  const planId = plans[0].id;

  const tripDays = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
  const days = buildInitialDays(tripDays);
  if (days.length) {
    const scaffold = days.map((d, idx) => ({
      plan_id: planId,
      date: d.id,
      position: idx,
    }));
    const { error: daysError } = (await supabase.from('plan_days').insert(scaffold)) as unknown as {
      error: unknown;
    };
    if (daysError) throw daysError;
  }

  return { id: planId };
}
