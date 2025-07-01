"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { closestCenter } from "@dnd-kit/core";

import { useTripRange } from "./useTripRange";
import { useItinerary } from "./useItinerary";
import { useDnDPlanner } from "./useDnDPlanner";
import { buildInitialDays } from "@/utils/initialDays";
import type { DayPlan, Activity } from "@/types/itinerary";

export function usePlanner() {
  const params = useSearchParams();
  const dest = params.get("dest")?.trim().toLowerCase() ?? "";

  const { tripDays, currentRange, handleRangeChange } = useTripRange(dest);
  const { isLoading, error } = useItinerary(dest);

  const {
    days,
    setDays,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
  } = useDnDPlanner(buildInitialDays(tripDays));

  useEffect(() => {
    setDays(buildInitialDays(tripDays));
  }, [tripDays, setDays]);

  /** MVP: push new activity to the first day */
  const addActivity = (activity: Activity) => {
    setDays((prev) => {
      if (prev.length === 0) return prev;
      const clone: DayPlan[] = structuredClone(prev);
      clone[0].activities.push(activity);
      return clone;
    });
  };

  return {
    dest,
    days,
    tripDays,
    currentRange,
    isLoading,
    error,
    activeId,
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragOver,
    handleRangeChange,
    addActivity,
  };
}
