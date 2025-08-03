// src/app/planner/actions/createPlan.ts
'use server';

import { eachDayOfInterval } from 'date-fns';
import { supabaseServer } from '@/lib/supabaseServer';
import { buildInitialDays } from '@/utils';

interface DestinationInfo {
  name: string;
  latitude?: number;
  longitude?: number;
}

export async function createPlan(title: string, dest: DestinationInfo, start: string, end: string) {
  const supabase = supabaseServer();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Insert plan
  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert({
      title,
      user_id: user?.id ?? null,
      start_date: startDate,
      end_date: endDate,
    })
    .select('id')
    .single();
  if (planError || !plan) throw planError ?? new Error('Failed to create plan');
  const planId = plan.id;

  // Upsert destination (avoids duplicate‐key errors)
  const { data: destRow, error: destError } = await supabase
    .from('destinations')
    .upsert(
      {
        name: dest.name,
        latitude: dest.latitude,
        longitude: dest.longitude,
      },
      { onConflict: 'name' }
    )
    .select('id')
    .single();
  if (destError || !destRow) throw destError ?? new Error('Failed to upsert destination');
  const destId = destRow.id;

  // 4) Link plan → destination
  const { error: linkError } = await supabase
    .from('plan_destinations')
    .insert({ plan_id: planId, destination_id: destId, position: 0 });
  if (linkError) throw linkError;

  // 5) Build and insert days
  const tripDays = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
  const days = buildInitialDays(tripDays);

  if (days.length) {
    const scaffold = days.map((d, idx) => ({
      plan_id: planId,
      date: d.id,
      position: idx,
      destination_id: destId,
    }));
    const { error: daysError } = await supabase.from('plan_days').insert(scaffold);
    if (daysError) throw daysError;
  }

  return { id: planId };
}
