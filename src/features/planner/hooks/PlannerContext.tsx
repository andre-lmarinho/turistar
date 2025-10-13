'use client';

import { usePlanner } from '@/features/planner/hooks/usePlanner';
import { useSelectedActivity } from '@/features/planner/hooks/useSelectedActivity';
import { usePlanCollaboration } from '@/features/planner/hooks/usePlanCollaboration';
import { createContextProvider } from '@/shared/lib/createContextProvider';
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
  const { data: storedDaysRaw, persistDays } = usePlanCollaboration(planId, { enabled: persist });
  const storedDays = storedDaysRaw ?? undefined;
  const planner = usePlanner({
    initialDays: storedDays ?? initialDays,
    planId,
    dest,
    persistDays,
  });
  const { days, setDays } = usePersistedPlannerDays({
    planner,
    persistDays,
    persist,
    storedDays,
  });

  const selected = useSelectedActivity(days, setDays, {
    addActivity: planner.addActivity,
    removeActivity: planner.removeActivity,
    updateActivity: planner.updateActivity,
  });

  return { ...planner, days, setDays, ...selected };
}

const [PlannerProvider, usePlannerContext] = createContextProvider(
  usePlannerContextValue,
  'usePlannerContext must be inside PlannerProvider'
);

export { PlannerProvider, usePlannerContext };
