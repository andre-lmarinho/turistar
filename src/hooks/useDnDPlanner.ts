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
import { formatISO } from "date-fns";
import { useState } from "react";
import type { DayPlan } from "@/types/itinerary";

/**
 * Encapsulates drag-and-drop state and handlers for DayPlan columns.
 */
export function useDnDPlanner(initial: DayPlan[] = []) {
  const [days, setDays] = useState<DayPlan[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /** Remember which card was picked up */
  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  /**
   * Live reorder on drag over:
   * - same column → use arrayMove
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

  /** Add an empty DayPlan at the end */
  function addDay(date: Date) {
    const iso = formatISO(date, { representation: "date" });
    if (days.some((d) => d.id === iso)) return;
    setDays([
      ...days,
      {
        id: iso,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
        }),
        activities: [],
      },
    ]);
  }

  /** Remove a DayPlan by id */
  function removeDay(id: string) {
    setDays(days.filter((d) => d.id !== id));
  }

  return {
    days,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    addDay,
    removeDay,
    setDays,
  };
}
