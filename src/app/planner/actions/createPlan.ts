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

  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);

  const baseFields = {
    title: dest,
    user_id: user.id,
    start_date: startDate,
    end_date: endDate,
  };

  let response = (await supabase
    .from('plans')
    .insert({ ...baseFields, dest })
    .select('id')
    .single()) as unknown as {
    data: { id: string } | null;
    error: unknown;
  };

  const missingDestColumn =
    typeof response.error === 'object' &&
    response.error !== null &&
    'message' in response.error &&
    typeof (response.error as { message: string }).message === 'string' &&
    (response.error as { message: string }).message.includes('column "dest"');

  if (missingDestColumn) {
    response = (await supabase
      .from('plans')
      .insert({ ...baseFields, destination: dest })
      .select('id')
      .single()) as unknown as {
      data: { id: string } | null;
      error: unknown;
    };
  }

  if (response.error || !response.data) throw response.error || new Error('Failed to create plan');
  const planId = response.data.id;

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
