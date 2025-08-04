// src/hooks/planner/usePlanDaysSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { PlanDay, DayPlan } from '@/types';
import { format, parseISO } from 'date-fns';

export function usePlanDays(planId: string, enabled = true) {
  const qc = useQueryClient();

  const days = useQuery({
    queryKey: ['plan_days', planId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('plan_days')
        .select('date, activities(*)')
        .eq('plan_id', planId)
        .order('position')) as unknown as {
        data: {
          date: string;
          activities: {
            id: string;
            title: string;
            color: string | null;
            address: string | null;
            category: string;
            description: string | null;
            start_time: string | null;
            duration: number | null;
            latitude: number | null;
            longitude: number | null;
            budget: number | null;
            image_url: string | null;
          }[];
        }[];
        error: unknown;
      };
      if (error) throw error;
      return data.map((d) => ({
        id: d.date,
        label: format(parseISO(d.date), 'EEE, dd MMM'),
        activities: d.activities.map((a) => ({
          id: a.id,
          title: a.title,
          color: a.color ?? undefined,
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
        .single()) as unknown as { data: PlanDay; error: unknown };
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_days', planId] }),
  });

  const persistDays = useMutation({
    mutationFn: async (state: DayPlan[]) => {
      const { data: existing, error } = (await supabase
        .from('plan_days')
        .select('id, date, destination_id')
        .eq('plan_id', planId)) as unknown as {
        data: { id: string; date: string; destination_id: string }[];
        error: unknown;
      };
      if (error) throw error;

      const incoming = new Set(state.map((d) => d.id));
      const toRemove = existing.filter((d) => !incoming.has(d.date));
      if (toRemove.length) {
        const ids = toRemove.map((d) => d.id);
        const { error: delActsErr } = (await (supabase.from('activities') as any)
          .delete()
          .in('day_id', ids)) as { error: unknown };
        if (delActsErr) throw delActsErr;
        const { error: delDaysErr } = (await (supabase.from('plan_days') as any)
          .delete()
          .in('id', ids)) as { error: unknown };
        if (delDaysErr) throw delDaysErr;
      }

      let destinationId: string | undefined = existing[0]?.destination_id;
      if (!destinationId) {
        const { data: destRows, error: destErr } = (await supabase
          .from('plan_destinations')
          .select('destination_id')
          .eq('plan_id', planId)
          .order('position')) as unknown as {
          data: { destination_id: string }[] | null;
          error: unknown;
        };
        if (destErr) throw destErr;
        destinationId = destRows?.[0]?.destination_id ?? undefined;
      }
      for (let i = 0; i < state.length; i++) {
        const day = state[i];
        const found = existing.find((d) => d.date === day.id);
        let dayId = found?.id;
        let destId = found?.destination_id ?? destinationId;
        if (!destId) throw new Error('destination_id missing');
        if (!dayId) {
          const inserted = (await supabase
            .from('plan_days')
            .insert({ plan_id: planId, date: day.id, position: i, destination_id: destId })
            .select('id')
            .single()) as unknown as { data: { id: string } | null; error: unknown };
          if (inserted.error || !inserted.data) throw inserted.error;
          dayId = inserted.data.id;
        } else {
          const { error: updErr } = (await supabase
            .from('plan_days')
            .update({ position: i, date: day.id })
            .eq('id', dayId)) as unknown as { error: unknown };
          if (updErr) throw updErr;
        }
        const { error: delErr } = (await (supabase.from('activities') as any)
          .delete()
          .eq('day_id', dayId)) as { error: unknown };
        if (delErr) throw delErr;
        if (day.activities.length) {
          const payload = day.activities.map((a) => {
            const base = {
              day_id: dayId!,
              title: a.title,
              color: a.color,
              address: a.address,
              category: a.category,
              description: a.description,
              start_time: a.startTime,
              duration: a.duration,
              latitude: a.latitude,
              longitude: a.longitude,
              budget: a.budget,
              image_url: a.imageUrl,
            };
            return /^[0-9a-fA-F-]{36}$/.test(a.id) ? { ...base, id: a.id } : base;
          });
          const { error: insErr } = (await (supabase.from('activities') as any).insert(
            payload
          )) as { error: unknown };
          if (insErr) throw insErr;
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_days', planId] }),
  });

  return { ...days, upsertDay, persistDays };
}
