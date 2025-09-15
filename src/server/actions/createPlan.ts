// src/server/actions/createPlan.ts
'use server';
import { supabaseServer } from '@/shared/lib/supabaseServer';

interface DestinationInfo {
  name: string;
  latitude?: number;
  longitude?: number;
}

export async function createPlan(title: string, dest: DestinationInfo, start: string, end: string) {
  const supabase = supabaseServer();

  const startDate = start.slice(0, 10);
  const endDate = end.slice(0, 10);
  const { data, error } = await supabase.rpc('create_full_plan', {
    _title: title,
    _dest_name: dest.name,
    _dest_lat: dest.latitude ?? null,
    _dest_long: dest.longitude ?? null,
    _start_date: startDate,
    _end_date: endDate,
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
