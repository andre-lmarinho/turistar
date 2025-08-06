// src/hooks/planner/persistDaysHelpers.ts

import type { SupabaseQueryBuilder } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabaseClient';
import type { DayPlan } from '@/shared/types';

interface PlanDayRow {
  id: string;
  date: string;
  destination_id: string;
}

export interface QueryBuilder extends SupabaseQueryBuilder {
  select: (...args: unknown[]) => QueryBuilder;
  insert: (...args: unknown[]) => QueryBuilder;
  upsert: (...args: unknown[]) => QueryBuilder;
  update: (...args: unknown[]) => QueryBuilder;
  delete: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  in: (...args: unknown[]) => QueryBuilder;
  abortSignal: (signal: AbortSignal) => QueryBuilder;
  single: () => Promise<{ data: unknown; error: unknown }>;
}

interface ActivityUpsert {
  id?: string;
  day_id: string;
  title: string | null;
  color: string | null;
  address: string | null;
  category: string | null;
  description: string | null;
  start_time: string | null;
  duration: number | null;
  latitude: number | null;
  longitude: number | null;
  budget: number | null;
  image_url: string | null;
  position: number;
  catalog_id: string | null;
}

export async function fetchExistingDays(planId: string, signal: AbortSignal) {
  const { data, error } = (await (supabase.from('plan_days') as QueryBuilder)
    .select('id, date, destination_id')
    .eq('plan_id', planId)
    .abortSignal(signal)) as unknown as {
    data: PlanDayRow[];
    error: unknown;
  };
  if (error) throw error;
  return data;
}

export async function deleteRemovedDays(
  existing: PlanDayRow[],
  state: DayPlan[],
  signal: AbortSignal
) {
  const incoming = new Set(state.map((d) => d.id));
  const toRemove = existing.filter((d) => !incoming.has(d.date));

  if (toRemove.length) {
    const ids = toRemove.map((d) => d.id);
    const { error: delActsErr } = (await (supabase.from('activities') as QueryBuilder)
      .delete()
      .in('day_id', ids)
      .abortSignal(signal)) as unknown as { error: unknown };
    if (delActsErr) throw delActsErr;
    const { error: delDaysErr } = (await (supabase.from('plan_days') as QueryBuilder)
      .delete()
      .in('id', ids)
      .abortSignal(signal)) as unknown as { error: unknown };
    if (delDaysErr) throw delDaysErr;
  }
}

export async function upsertDayActivities(
  dayId: string,
  activities: DayPlan['activities'],
  existingActs: Set<string>,
  signal: AbortSignal
) {
  const incomingIds = new Set<string>();
  const updates: ActivityUpsert[] = [];
  const inserts: ActivityUpsert[] = [];

  for (let j = 0; j < activities.length; j++) {
    const a = activities[j];
    incomingIds.add(a.id);
    const base: ActivityUpsert = {
      day_id: dayId,
      title: a.title,
      color: a.color ?? null,
      address: a.address ?? null,
      category: a.category ?? null,
      description: a.description ?? null,
      start_time: a.startTime ?? null,
      duration: a.duration ?? null,
      latitude: a.latitude ?? null,
      longitude: a.longitude ?? null,
      budget: a.budget ?? null,
      image_url: a.imageUrl ?? null,
      position: j,
      catalog_id: null,
    };
    if (/^[0-9a-fA-F-]{36}$/.test(a.id)) updates.push({ ...base, id: a.id });
    else inserts.push(base);
  }

  if (updates.length) {
    const { error: upErr } = (await (supabase.from('activities') as QueryBuilder)
      .upsert(updates)
      .abortSignal(signal)) as unknown as { error: unknown };
    if (upErr) throw upErr;
  }
  if (inserts.length) {
    const { error: insErr } = (await (supabase.from('activities') as QueryBuilder)
      .insert(inserts)
      .abortSignal(signal)) as unknown as { error: unknown };
    if (insErr) throw insErr;
  }

  const toDeleteActs = [...existingActs].filter((id) => !incomingIds.has(id));
  if (toDeleteActs.length) {
    const { error: delErr } = (await (supabase.from('activities') as QueryBuilder)
      .delete()
      .in('id', toDeleteActs)
      .abortSignal(signal)) as unknown as { error: unknown };
    if (delErr) throw delErr;
  }
}
