"use client";

import { addDays, parseISO } from "date-fns";
import { useCallback, useMemo } from "react";
import type { DateRange } from "react-day-picker";

import { buildInitialDays } from "@/features/activity/lib/dayOperations";
import type { Activity, DayPlan } from "@/features/activity/types";
import { usePlanCollaboration } from "@/features/events/hooks/usePlanCollaboration";
import { midpoint } from "@/features/events/lib/gapOrdering";
import type { ActivityDestination } from "@/features/events/lib/planOperations";
import { changeDateRangeOperations, moveActivityOperation } from "@/features/events/lib/planOperations";
import { useDestinationCoordinates } from "@/features/search/hooks/useDestinationCoordinates";

interface PlannerDocumentOptions {
  initialDays?: DayPlan[];
  planId: string;
  dest?: string;
  viewerUserId?: string | null;
}

function getDefaultTripDates(count = 3): Date[] {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => addDays(today, index));
}

function dateRangeToArray(range: DateRange): Date[] {
  if (!range.from) return [];

  const dates: Date[] = [];
  const end = range.to ?? range.from;
  for (let current = range.from; current <= end; current = addDays(current, 1)) {
    dates.push(current);
  }
  return dates;
}

export function usePlannerDocument({
  initialDays,
  planId,
  dest,
  viewerUserId = null,
}: PlannerDocumentOptions) {
  const seedDays = initialDays ?? buildInitialDays(getDefaultTripDates());
  const {
    data: days = seedDays,
    dispatch,
    error,
    isPending,
    isLoading,
    discardPending,
    retryPending,
    hasPendingChanges,
  } = usePlanCollaboration(planId, {
    enabled: true,
    actorId: viewerUserId,
    initialDays: seedDays,
  });
  const destCoords = useDestinationCoordinates(dest);

  const createActivity = useCallback(
    (dayId: string, activity: Activity) => {
      if (!activity.title.trim()) return false;
      return dispatch((current) => {
        const day = current.find((candidate) => candidate.id === dayId);
        if (!day) return [];
        return [
          {
            type: "activity.created",
            payload: { dayId, activity, position: midpoint(day.activities.at(-1)?.position) },
          },
        ];
      });
    },
    [dispatch]
  );
  const updateActivity = useCallback(
    (activityId: string, patch: Partial<Activity>) => {
      dispatch(() => [
        {
          type: "activity.updated",
          payload: {
            activityId,
            patch: {
              ...patch,
              ...("latitude" in patch ? { latitude: patch.latitude ?? null } : {}),
              ...("longitude" in patch ? { longitude: patch.longitude ?? null } : {}),
            },
          },
        },
      ]);
    },
    [dispatch]
  );
  const deleteActivity = useCallback(
    (activityId: string) => {
      dispatch(() => [{ type: "activity.deleted", payload: { activityId } }]);
    },
    [dispatch]
  );
  const moveActivity = useCallback(
    (activityId: string, destination: ActivityDestination) => {
      dispatch((current) => moveActivityOperation(current, activityId, destination));
    },
    [dispatch]
  );

  const currentRange = useMemo(() => {
    if (days.length === 0) return undefined;
    const from = parseISO(days[0].id);
    const to = parseISO(days[days.length - 1].id);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return undefined;
    return { from, to };
  }, [days]);

  const handleRangeChange = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) return;

      dispatch((current) => changeDateRangeOperations(current, dateRangeToArray(range)));
    },
    [dispatch]
  );

  return {
    planId,
    days,
    createActivity,
    updateActivity,
    deleteActivity,
    moveActivity,
    error,
    isPending,
    isLoading,
    discardPending,
    dest,
    destCoords,
    currentRange,
    handleRangeChange,
    retryPending,
    hasPendingChanges,
  };
}
