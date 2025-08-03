// src/app/planner/actions/updatePlan.ts
'use server';

import { supabaseServer } from '@/lib/supabaseServer';

export async function setPlanTitle(planId: string, title: string) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('plans').update({ title }).eq('id', planId);
  if (error) throw error;
}

interface PlaceSelection {
  name: string;
  latitude: number;
  longitude: number;
}

export async function setPlanDestination(planId: string, dest: PlaceSelection) {
  const supabase = supabaseServer();

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

  const { error: linkError } = await supabase
    .from('plan_destinations')
    .upsert({ plan_id: planId, destination_id: destId, position: 0 });
  if (linkError) throw linkError;

  const { error: daysError } = await supabase
    .from('plan_days')
    .update({ destination_id: destId })
    .eq('plan_id', planId);
  if (daysError) throw daysError;
}
