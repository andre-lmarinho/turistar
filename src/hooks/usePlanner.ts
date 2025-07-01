// src/hooks/usePlanner.ts
"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { formatISO } from "date-fns";
import { closestCenter } from "@dnd-kit/core";

import { useItinerary } from "./useItinerary";
import { useDnDPlanner } from "./useDnDPlanner";
import { useTripRange } from "./useTripRange";
import { distributeRoundRobin } from "@/utils/distributeRoundRobin";
import type { DayPlan, Activity } from "@/types/itinerary";

/**
 * Encapsulates all planner logic: URL params, data fetching,
 * date‐range handling, and drag-and-drop state.
 */
export function usePlanner() {
  // Read the destination from query string
  const params = useSearchParams();
  const dest   = params.get("dest")?.trim().toLowerCase() ?? "";

  // Manage start/end dates and date picker state
  const { tripDays, currentRange, handleRangeChange } = useTripRange(dest);

  // Build an array of empty DayPlan objects for each trip day
  const baseDays: DayPlan[] = useMemo(
    () =>
      tripDays.map((d) => ({
        id: formatISO(d, { representation: "date" }),
        label: d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
        }),
        activities: [],
      })),
    [tripDays]
  );

  // Fetch raw itinerary from API
  const { days: fetched, isLoading, error } = useItinerary(dest);

  // Set up DnD planner state and handlers
  const {
    days,
    setDays,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
  } = useDnDPlanner(baseDays);

  // Distribute fetched activities into the empty days once data arrives
  useEffect(() => {
    if (!fetched) return;
    const acts: Activity[] = fetched.flatMap((d) => d.activities);
    setDays(distributeRoundRobin(baseDays, acts));
  }, [fetched, baseDays, setDays]);

  return {
    // Data + state
    dest,
    days,
    tripDays,
    currentRange,
    isLoading,
    error,
    activeId,

    // DnD configuration
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragOver,

    // Actions
    handleRangeChange,
  };
}
