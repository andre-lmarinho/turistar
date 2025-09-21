// src/features/planner/hooks/usePlanDaysSupabase.ts

import {
  mapPlanDaysFromSupabase,
  type SupabaseActivityRow,
  type SupabasePlanDayRow,
} from '@/features/planner/services/supabase/planDaysMapper';
import { usePlanResource } from '@/shared/hooks/usePlanResource';
import type { SupabaseQueryBuilder } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabaseClient';
import type { PlanDay, DayPlan } from '@/shared/types';
import { fetchExistingDays, deleteRemovedDays, upsertDayActivities } from './persistDaysHelpers';

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

export function usePlanDays(planId: string, enabled = true) {
  const days = usePlanResource<DayPlan[]>({
    planId,
    resource: 'plan_days',
    fetcher: async (id) => {
      const { data, error } = (await (supabase.from('plan_days') as QueryBuilder)
        .select('date, activities(*)')
        .eq('plan_id', id)
        .order('position')
        .order('position', { foreignTable: 'activities' })) as unknown as {
        data: SupabasePlanDayRow[];
        error: unknown;
      };
      if (error) throw error;
      return mapPlanDaysFromSupabase(data);
    },
    enabled,
  });

  const upsertDay = usePlanResource<PlanDay, Partial<PlanDay>>({
    planId,
    resource: 'plan_days',
    persistFn: async (id, payload, signal) => {
      const { error, data } = (await (supabase.from('plan_days') as QueryBuilder)
        .upsert(payload)
        .select()
        .abortSignal(signal)
        .single()) as { data: PlanDay; error: unknown };
      if (error) throw error;
      return data;
    },
  });

  const persistDays = usePlanResource<unknown, DayPlan[]>({
    planId,
    resource: 'plan_days',
    persistFn: async (id, state, signal) => {
      const existing = await fetchExistingDays(id, signal);
      await deleteRemovedDays(existing, state, signal);

      let destinationId: string | undefined = existing[0]?.destination_id;
      if (!destinationId) {
        const { data: destRows, error: destErr } = (await (
          supabase.from('plan_destinations') as QueryBuilder
        )
          .select('destination_id')
          .eq('plan_id', id)
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
        data: Pick<SupabaseActivityRow, 'id' | 'day_id'>[] | null;
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
            .insert({ plan_id: id, date: day.id, position: i, destination_id: destId })
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
        await upsertDayActivities(dayId!, day.activities, existingActs, signal);
      }
    },
  });

  return { ...days, upsertDay, persistDays };
}
