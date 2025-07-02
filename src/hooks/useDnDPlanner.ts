// src/hooks/useDnDPlanner.ts
"use client";

import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import type { DayPlan, Activity } from "@/types/itinerary";

/**
 * Encapsulates drag-and-drop state and handlers for DayPlan columns.
 */
export function useDnDPlanner(initial: DayPlan[] = []) {
  const [days, setDays] = useState<DayPlan[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ------------------------------- sensors ------------------------------ */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /* ----------------------------- dnd events ----------------------------- */
  /** Remember which card was picked up */
  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  /**
   * Live reorder on drag over:
   * - same column → arrayMove
   * - cross-column → splice out + insert
   */
  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const src = days.find((d) =>
      d.activities.some((a) => a.id === active.id)
    );
    const dst = days.find(
      (d) =>
        d.id === over.id ||
        d.activities.some((a) => a.id === over.id)
    );
    if (!src || !dst) return;

    const oldIdx = src.activities.findIndex((a) => a.id === active.id);
    const overIdx =
      dst.id === over.id
        ? dst.activities.length
        : dst.activities.findIndex((a) => a.id === over.id);

    if (src === dst) {
      src.activities = arrayMove(src.activities, oldIdx, overIdx);
    } else {
      const [moved] = src.activities.splice(oldIdx, 1);
      dst.activities.splice(overIdx, 0, moved);
    }

    setDays([...days]);
  }

  /* --------------------------- add / remove ----------------------------- */
  function addActivity(act: Activity, dayIndex = 0) {
    setDays((prev) => {
      const copy = [...prev];
      if (!copy[dayIndex])
        copy[dayIndex] = {
          id: `temp-${Date.now()}`,
          label: `Day ${dayIndex + 1}`,
          activities: [],
        };
      copy[dayIndex].activities.push(act);
      return copy;
    });
  }

  /** Removes activity by id from whichever day contains it. */
  function removeActivity(id: string) {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        activities: day.activities.filter((a) => a.id !== id),
      }))
    );
  }

  /* --------------------------------------------------------------------- */
  return {
    days,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    setDays,
    addActivity,
    removeActivity,
  };
}
