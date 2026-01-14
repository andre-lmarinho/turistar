"use client";

import { pointerWithin } from "@dnd-kit/core";
import { eachDayOfInterval } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { buildInitialDays } from "@/features/app/planner/domain/days/initialDays";
import { syncDaysWithTripRange } from "@/features/app/planner/domain/days/syncDaysWithTripRange";
import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import { updatePlanDates } from "@/features/app/planner/server/actions/plans/updatePlanDates";
import { useDnDPlanner } from "../dnd/useDnDPlanner";
import { useTripRange } from "./useTripRange";

interface UsePlannerOptions {
  initialDays?: DayPlan[];
  planId?: string;
  dest?: string;
  persistDays?: { mutate: (state: DayPlan[]) => void };
  canEdit?: boolean;
}

function dedupeDays(days: DayPlan[]): DayPlan[] {
  return Array.from(new Map(days.map((day) => [day.id, day])).values());
}

export function usePlanner(options: UsePlannerOptions = {}) {
  const params = useSearchParams();
  const urlDest = params.get("dest")?.trim().toLowerCase() ?? "";
  const parseFiniteParam = (value: string | null): number | null => {
    if (value == null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const lat = parseFiniteParam(params.get("lat"));
  const lng = parseFiniteParam(params.get("lng"));
  const destCoords = lat != null && lng != null ? { lat, lng } : null;
  const dest = options.dest ?? urlDest;
  const planId = options.planId ?? "";

  const { tripDays, currentRange, handleRangeChange: setRange } = useTripRange(options.initialDays ?? []);

  const editingEnabled = options.canEdit ?? true;

  /* DnD state */
  const initialDnDDays = useMemo(
    () =>
      options.initialDays && options.initialDays.length > 0
        ? dedupeDays(options.initialDays)
        : buildInitialDays(tripDays),
    [options.initialDays, tripDays]
  );

  const {
    days,
    setDays,
    getDaysSnapshot,
    activeId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
    insertActivityAt,
    replaceActivity,
  } = useDnDPlanner(initialDnDDays);

  function persistOnDragEnd(event?: Parameters<typeof handleDragEnd>[0]) {
    if (!editingEnabled) return;
    handleDragEnd(event);
    options.persistDays?.mutate(getDaysSnapshot());
  }

  /**
   * Updates the planner when the trip range changes.
   *
   * - Persists the new start and end dates to the database.
   * - Syncs the local day plan state with the new range and persists it.
   */
  async function handleRangeChange(r: DateRange | undefined) {
    if (!editingEnabled) return;
    setRange(r);
    if (!r?.from || !r?.to) return;
    try {
      if (options.planId) {
        await updatePlanDates(options.planId, r.from, r.to);
      }
      const newTripDays = eachDayOfInterval({ start: r.from, end: r.to });
      setDays((prev: DayPlan[]) => {
        const cleaned = dedupeDays(prev);
        const updated = syncDaysWithTripRange(cleaned, newTripDays);
        options.persistDays?.mutate(updated);
        return updated;
      });
    } catch (err) {
      console.error(`Failed to update planner range for plan ${options.planId}`, err);
    }
  }

  const noop = () => undefined;

  return {
    planId,
    dest,
    destCoords,
    days,
    setDays,
    tripDays,
    currentRange,
    activeId,
    sensors: editingEnabled ? sensors : undefined,
    collisionDetection: pointerWithin,
    handleDragStart: editingEnabled ? handleDragStart : noop,
    handleDragOver: editingEnabled ? handleDragOver : noop,
    handleDragEnd: editingEnabled ? persistOnDragEnd : noop,
    handleRangeChange,
    addActivity: editingEnabled ? addActivity : noop,
    removeActivity: editingEnabled ? removeActivity : noop,
    updateActivity: editingEnabled ? updateActivity : noop,
    addBlankActivity: editingEnabled ? addBlankActivity : noop,
    insertActivityAt: editingEnabled ? insertActivityAt : () => undefined,
    replaceActivity: editingEnabled ? replaceActivity : () => undefined,
  };
}
