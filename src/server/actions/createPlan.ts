// src/server/actions/createPlan.ts
'use server';

import { supabaseServer } from '@/shared/lib/supabaseServer';

import {
  createPlanSchema,
  getFriendlyZodMessage,
  type CreatePlanInput,
  type PlanDestinationInput,
} from './planSchemas';

export type { PlanDestinationInput } from './planSchemas';

export async function createPlan(
  title: CreatePlanInput['title'],
  dest: PlanDestinationInput,
  start: CreatePlanInput['startDate'],
  end: CreatePlanInput['endDate']
) {
  let parsed;
  try {
    parsed = createPlanSchema.parse({
      title,
      destination: dest,
      startDate: start,
      endDate: end,
    });
  } catch (error) {
    throw new Error(getFriendlyZodMessage(error, 'Invalid plan details.'));
  }

  const { title: safeTitle, destination, startDate, endDate } = parsed;
  const supabase = supabaseServer();

  const startISODate = startDate.toISOString().slice(0, 10);
  const endISODate = endDate.toISOString().slice(0, 10);

  const { data, error } = await supabase.rpc('create_full_plan', {
    _title: safeTitle,
    _dest_name: destination.name,
    _dest_lat: destination.latitude ?? null,
    _dest_long: destination.longitude ?? null,
    _start_date: startISODate,
    _end_date: endISODate,
  });

  if (error || !data) throw error ?? new Error('Failed to create plan');
  const row = Array.isArray(data) ? data[0] : data;

  const { plan_id, public_slug, edit_token } = row as {
    plan_id: string;
    public_slug: string;
    edit_token: string;
  };

  return { id: plan_id, publicSlug: public_slug, editToken: edit_token };
}
