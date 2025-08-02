// src/hooks/planner/usePlanDaysSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { PlanDay, Activity } from '@/types';

export function usePlanDays(planId: string) {
  const qc = useQueryClient();

  const days = useQuery({
    queryKey: ['plan_days', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_days')
        .select('*, activities(*)')
        .eq('plan_id', planId)
        .order('position');
      if (error) throw error;
      return data as (PlanDay & { activities: Activity[] })[];
    },
  });

  const upsertDay = useMutation({
    mutationFn: async (payload: Partial<PlanDay>) => {
      const { error, data } = await supabase.from('plan_days').upsert(payload).select().single();
      if (error) throw error;
      return data as PlanDay;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_days', planId] }),
  });

  return { ...days, upsertDay };
}
