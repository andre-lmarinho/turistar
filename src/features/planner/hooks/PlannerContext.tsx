// src/features/planner/hooks/PlannerContext.tsx
'use client';

import { usePlanner } from '@/features/planner/hooks/usePlanner';
import { useSelectedActivity } from '@/features/planner/hooks/useSelectedActivity';
import { usePlanDays } from '@/features/planner/hooks/usePlanDaysSupabase';
import { createContextProvider } from '@/shared/context/createContextProvider';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { usePersistedPlannerDays } from './usePersistedPlannerDays';

type PlannerCtx = ReturnType<typeof usePlanner> & ReturnType<typeof useSelectedActivity>;

function usePlannerContextValue({
  initialDays,
  planId,
  dest,
  persist = true,
}: {
  initialDays?: DayPlan[];
  planId: string;
  dest?: string;
  persist?: boolean;
}): PlannerCtx {
  const { data: storedDays, persistDays } = usePlanDays(planId, persist);
  const planner = usePlanner({
    initialDays: (storedDays as unknown as DayPlan[]) ?? initialDays,
    planId,
    dest,
    persistDays,
  });
  const { days, setDays } = usePersistedPlannerDays({
    planner,
    persistDays,
    persist,
    storedDays: storedDays as DayPlan[] | undefined,
  });

  const selected = useSelectedActivity(days, setDays, {
    addActivity: planner.addActivity,
    removeActivity: planner.removeActivity,
    updateActivity: planner.updateActivity,
    addBlankActivity: planner.addBlankActivity,
  });

  return { ...planner, days, setDays, ...selected };
}

const [PlannerProvider, usePlannerContext] = createContextProvider(
  usePlannerContextValue,
  'usePlannerContext must be inside PlannerProvider'
);

export { PlannerProvider, usePlannerContext };
