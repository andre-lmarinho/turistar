// src/features/planner/hooks/useOptimisticReorder.ts
'use client';

import { useCallback, useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import {
  applyPlannerReorder,
  type PlannerReorderInput,
} from '@/features/planner/services/applyPlannerReorder';
import { showPlannerToast } from '@/features/planner/ui/usePlannerToast';

interface UseOptimisticReorderOptions {
  planId: string;
  getDaysSnapshot: () => DayPlan[];
  setDays: Dispatch<SetStateAction<DayPlan[]>>;
}

interface MutationContext {
  previous: DayPlan[];
  optimistic?: {
    days: DayPlan[];
    newPosition: string;
  };
}

async function persistReorder(planId: string, payload: PlannerReorderInput) {
  const response = await fetch(`/api/plans/${planId}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to reorder activities');
  }

  return (await response.json()) as { position: string };
}

export function useOptimisticReorder({
  planId,
  getDaysSnapshot,
  setDays,
}: UseOptimisticReorderOptions) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['planner', planId, 'days'] as const, [planId]);

  useEffect(() => {
    queryClient.setQueryData(queryKey, getDaysSnapshot());
  }, [queryClient, planId, getDaysSnapshot, queryKey]);

  const mutation = useMutation<{ position: string }, Error, PlannerReorderInput, MutationContext>({
    mutationKey: ['planner', planId, 'reorder'],
    mutationFn: (variables) => persistReorder(planId, variables),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<DayPlan[]>(queryKey) ?? structuredClone(getDaysSnapshot());
      const optimistic = applyPlannerReorder(previous, variables);
      if (optimistic) {
        queryClient.setQueryData(queryKey, optimistic.days);
        setDays(optimistic.days);
      }
      return { previous, optimistic: optimistic ?? undefined } satisfies MutationContext;
    },
    onSuccess: (data, variables) => {
      const updatePositions = (source: DayPlan[]) =>
        source.map((day) => ({
          ...day,
          activities: day.activities.map((activity) =>
            activity.id === variables.itemId
              ? { ...activity, position: data.position }
              : activity
          ),
        }));

      const cached = queryClient.getQueryData<DayPlan[]>(queryKey);
      if (cached) {
        queryClient.setQueryData(queryKey, updatePositions(cached));
      }
      setDays((prev) => updatePositions(prev));
    },
    onError: (error, _variables, context) => {
      const fallback = context?.previous ?? getDaysSnapshot();
      queryClient.setQueryData(queryKey, fallback);
      setDays(fallback);
      showPlannerToast({
        type: 'error',
        message: 'Mudança desfeita. Não foi possível salvar.',
      });
      console.error('Failed to persist planner reorder', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const reorder = useCallback(
    (input: PlannerReorderInput) => mutation.mutateAsync(input),
    [mutation]
  );

  return { reorder, isPending: mutation.isPending };
}

export type UseOptimisticReorderReturn = ReturnType<typeof useOptimisticReorder>;

