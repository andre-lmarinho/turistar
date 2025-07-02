// src/hooks/usePlanner.ts
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { closestCenter } from "@dnd-kit/core";

import { useTripRange } from "@/hooks/useTripRange";
import { useItinerary } from "@/hooks/useItinerary";
import { useDnDPlanner } from "@/hooks/useDnDPlanner";
import { buildInitialDays } from "@/utils/initialDays";
import type { Activity } from "@/types/itinerary";

/**
 * High-level planner hook
 * - URL params      (dest, ?start, ?end)
 * - Date-range      (tripDays)
 * - Data fetch      (itinerary)
 * - Drag-and-drop   (days board)
 * - Helpers         (add / remove / update)
 */
export function usePlanner() {
  /* ----------------------- URL + date range ----------------------- */
  const params = useSearchParams();
  const dest   = params.get("dest")?.trim().toLowerCase() ?? "";

  const { tripDays, currentRange, handleRangeChange } = useTripRange(dest);
  const { isLoading, error } = useItinerary(dest);

  /* -------------------------- DnD state --------------------------- */
  const {
    days,
    setDays,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    addActivity,  
    removeActivity,
    updateActivity, 
  } = useDnDPlanner(buildInitialDays(tripDays));

  /* Reset the board whenever date range changes */
  useEffect(() => {
    setDays(buildInitialDays(tripDays));
  }, [tripDays, setDays]);

  /* --------------------------- export ----------------------------- */
  return {
    dest,
    days,
    tripDays,
    currentRange,
    isLoading,
    error,
    activeId,

    /* DnD configuration */
    sensors,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragOver,

    /* Date-picker */
    handleRangeChange,

    /* Add / remove helpers for the filter panel */
    addActivity,
    removeActivity,
    updateActivity, 
  };
}
