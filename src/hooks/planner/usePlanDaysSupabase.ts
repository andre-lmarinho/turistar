// src/hooks/planner/usePlanDaysSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { PlanDay, Activity } from '@/types';

export function usePlanDays(planId: string, enabled = true) {
  const qc = useQueryClient();

  const days = useQuery({
    queryKey: ['plan_days', planId],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('plan_days')
        .select('*, activities(*)')
        .eq('plan_id', planId)
        .order('position')) as unknown as {
        data: (PlanDay & { activities: Activity[] })[];
        error: unknown;
      };
      if (error) throw error;
      return data;
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

  return { ...days, upsertDay };
}
