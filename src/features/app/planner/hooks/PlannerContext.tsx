"use client";

import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import { usePlanCollaboration } from "@/features/app/planner/hooks/data/usePlanCollaboration";
import { usePlanner } from "@/features/app/planner/hooks/state/planner/usePlanner";
import { useSelectedActivity } from "@/features/app/planner/hooks/state/planner/useSelectedActivity";
import { createContextProvider } from "@/shared/lib/createContextProvider";
import { usePersistedPlannerDays } from "./state/planner/usePersistedPlannerDays";

type PlannerCtx = ReturnType<typeof usePlanner> &
  ReturnType<typeof useSelectedActivity> & {
    canEdit: boolean;
    viewerUserId: string | null;
    isOwner: boolean;
    isAdmin: boolean;
    canManageMembers: boolean;
  };

export function usePlannerContextValue({
  initialDays,
  planId,
  dest,
  persist = true,
  canEdit = true,
  viewerUserId = null,
  isOwner = false,
  isAdmin = false,
  canManageMembers = false,
}: {
  initialDays?: DayPlan[];
  planId: string;
  dest?: string;
  persist?: boolean;
  canEdit?: boolean;
  viewerUserId?: string | null;
  isOwner?: boolean;
  isAdmin?: boolean;
  canManageMembers?: boolean;
}): PlannerCtx {
  const { data: storedDaysRaw, persistDays } = usePlanCollaboration(planId, { enabled: persist });
  const storedDays = storedDaysRaw ?? undefined;
  const planner = usePlanner({
    initialDays: storedDays ?? initialDays,
    planId,
    dest,
    persistDays,
    canEdit,
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

  return {
    ...planner,
    days,
    setDays,
    ...selected,
    canEdit,
    viewerUserId,
    isOwner,
    isAdmin,
    canManageMembers,
  };
}

export const [PlannerProvider, usePlannerContext] = createContextProvider(
  usePlannerContextValue,
  "usePlannerContext must be inside PlannerProvider"
);
