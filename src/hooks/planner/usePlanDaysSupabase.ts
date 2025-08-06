// src/hooks/planner/usePlanDaysSupabase.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { SupabaseQueryBuilder } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { PlanDay, DayPlan } from '@/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';
import { format, parseISO } from 'date-fns';

interface PlanDayRow {
  id: string;
  plan_id: string;
  date: string;
  position: number | null;
  destination_id: string;
}

interface ActivityRow {
  id: string;
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
  catalog_id: string | null;
  position: number | null;
}

interface QueryBuilder extends SupabaseQueryBuilder {
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

interface PlanDayWithActivities {
  date: string;
  activities: ActivityRow[];
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

export function usePlanDays(planId: string, enabled = true) {
  const qc = useQueryClient();

  const days = useQuery({
    queryKey: ['plan_days', planId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('plan_days')
        .select('date, activities(*)')
        .eq('plan_id', planId)
        .order('position')
        .order('position', { foreignTable: 'activities' })) as unknown as {
        data: PlanDayWithActivities[];
        error: unknown;
      };
      if (error) throw error;
      return data.map((d) => ({
        id: d.date,
        label: format(parseISO(d.date), 'EEE, dd MMM'),
        activities: d.activities.map((a) => ({
          id: a.id,
          title: a.title,
          color: a.color ?? DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
          address: a.address ?? undefined,
          category: a.category,
          description: a.description ?? undefined,
          startTime: a.start_time ?? undefined,
          duration: a.duration ?? undefined,
          latitude: a.latitude ?? undefined,
          longitude: a.longitude ?? undefined,
          budget: a.budget ?? undefined,
          imageUrl: a.image_url ?? undefined,
        })),
      })) as DayPlan[];
    },
    enabled,
  });

  const upsertDay = useMutation({
    mutationFn: async (payload: Partial<PlanDay>) => {
      const { error, data } = (await supabase
        .from('plan_days')
        .upsert(payload)
        .select()
        .single()) as { data: PlanDay; error: unknown };
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_days', planId] }),
  });
  const abortRef = useRef<AbortController | null>(null);

  const persistDays = useMutation({
    mutationFn: async (state: DayPlan[]) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      const { data: existing, error } = (await (supabase.from('plan_days') as QueryBuilder)
        .select('id, date, destination_id')
        .eq('plan_id', planId)
        .abortSignal(signal)) as unknown as {
        data: Pick<PlanDayRow, 'id' | 'date' | 'destination_id'>[];
        error: unknown;
      };
      if (error) throw error;

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

      let destinationId: string | undefined = existing[0]?.destination_id;
      if (!destinationId) {
        const { data: destRows, error: destErr } = (await (
          supabase.from('plan_destinations') as QueryBuilder
        )
          .select('destination_id')
          .eq('plan_id', planId)
          .order('position')
          .abortSignal(signal)) as unknown as {
          data: { destination_id: string }[] | null;
          error: unknown;
        };
        if (destErr) throw destErr;
        destinationId = destRows?.[0]?.destination_id ?? undefined;
      }

      const { data: existingActsRows, error: existingActsErr } = (await (
        supabase.from('activities') as QueryBuilder
      )
        .select('id, day_id')
        .in(
          'day_id',
          existing.map((d) => d.id)
        )
        .abortSignal(signal)) as unknown as {
        data: Pick<ActivityRow, 'id' | 'day_id'>[] | null;
        error: unknown;
      };
      if (existingActsErr) throw existingActsErr;
      const actMap = new Map<string, Set<string>>();
      existingActsRows?.forEach((a) => {
        if (!actMap.has(a.day_id)) actMap.set(a.day_id, new Set());
        actMap.get(a.day_id)!.add(a.id);
      });

      for (let i = 0; i < state.length; i++) {
        const day = state[i];
        const found = existing.find((d) => d.date === day.id);
        let dayId = found?.id;
        let destId = found?.destination_id ?? destinationId;
        if (!destId) throw new Error('destination_id missing');
        if (!dayId) {
          const inserted = (await (supabase.from('plan_days') as QueryBuilder)
            .insert({ plan_id: planId, date: day.id, position: i, destination_id: destId })
            .select('id')
            .single()
            // @ts-expect-error abortSignal exists on the returned object
            .abortSignal(signal)) as unknown as {
            data: { id: string } | null;
            error: unknown;
          };
          if (inserted.error || !inserted.data) throw inserted.error;
          dayId = inserted.data.id;
        } else {
          const { error: updErr } = (await (supabase.from('plan_days') as QueryBuilder)
            .update({ position: i, date: day.id })
            .eq('id', dayId)
            .abortSignal(signal)) as unknown as { error: unknown };
          if (updErr) throw updErr;
        }

        const existingActs = actMap.get(dayId) ?? new Set();
        const incomingIds = new Set<string>();
        const updates: ActivityUpsert[] = [];
        const inserts: ActivityUpsert[] = [];

        for (let j = 0; j < day.activities.length; j++) {
          const a = day.activities[j];
          incomingIds.add(a.id);
          const base: ActivityUpsert = {
            day_id: dayId!,
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
    },
  });

  return { ...days, upsertDay, persistDays };
}
