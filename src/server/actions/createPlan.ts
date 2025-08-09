// src/server/actions/createPlan.ts
'use server';

import { performance } from 'node:perf_hooks';
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

  const totalStart = performance.now();
  console.time('create_full_plan');
  const { data: planId, error } = await supabase.rpc('create_full_plan', {
    _title: title,
    _dest_name: dest.name,
    _dest_lat: dest.latitude ?? null,
    _dest_long: dest.longitude ?? null,
    _start_date: startDate,
    _end_date: endDate,
  });
  console.timeEnd('create_full_plan');
  const totalMs = performance.now() - totalStart;
  console.log(`createPlan RPC total ${totalMs.toFixed(1)}ms`);

  if (error || !planId) throw error ?? new Error('Failed to create plan');

  return { id: planId };
}
