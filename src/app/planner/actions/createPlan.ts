// src/app/planner/actions/createPlan.ts
'use server';

import { eachDayOfInterval } from 'date-fns';
import { supabaseServerAction } from '@/lib/supabaseServer';
import { buildInitialDays } from '@/utils';

export async function createPlan(dest: string, start: string, end: string) {
  const supabase = supabaseServerAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);

  const { data: plan, error: planError } = (await supabase
    .from('plans')
    .insert({
      title: dest,
      dest,
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
    })
    .select('id')
    .single()) as unknown as {
    data: { id: string } | null;
    error: unknown;
  };
  if (planError || !plan) throw planError || new Error('Failed to create plan');
  const planId = plan.id;

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
