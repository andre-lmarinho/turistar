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
  const { error } = await supabase
    .from('plans')
    .update({
      dest: dest.name,
      dest_lat: dest.latitude,
      dest_lon: dest.longitude,
    })
    .eq('id', planId);
  if (error) throw error;
}
