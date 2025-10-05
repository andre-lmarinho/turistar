// src/server/actions/updatePlan.ts
'use server';

import { supabaseServer } from '@/shared/lib/supabaseServer';

import {
  getFriendlyZodMessage,
  setPlanDateRangeSchema,
  type SetPlanDateRangeInput,
} from './planSchemas';

export async function setPlanDateRange(
  planId: SetPlanDateRangeInput['planId'],
  from: SetPlanDateRangeInput['startDate'],
  to: SetPlanDateRangeInput['endDate']
) {
  let parsed;
  try {
    parsed = setPlanDateRangeSchema.parse({ planId, startDate: from, endDate: to });
  } catch (error) {
    throw new Error(getFriendlyZodMessage(error, 'Invalid date range.'));
  }

  const supabase = supabaseServer();
  const startISODate = parsed.startDate.toISOString().slice(0, 10);
  const endISODate = parsed.endDate.toISOString().slice(0, 10);

  const { error } = await supabase
    .from('plans')
    .update({
      start_date: startISODate,
      end_date: endISODate,
    })
    .eq('id', parsed.planId);
  if (error) {
    throw new Error(error.message ?? 'Failed to update plan date range');
  }
}
