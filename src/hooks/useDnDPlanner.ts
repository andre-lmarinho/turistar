// src/hooks/useDnDPlanner.ts
"use client";

import {
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { formatISO } from "date-fns";
import { useState } from "react";

import { DayPlan } from "@/types/itinerary";
import { MAX_ACTIVITIES_PER_DAY } from "@/constants/planner";

export function useDnDPlanner(initial: DayPlan[] = []) {
  // State: list of days and the id of the item currently being dragged
  const [days, setDays] = useState<DayPlan[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure pointer sensor (drag distance > 8px to activate)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /** Remember which item was picked up */
  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  /**
   * On drop:
   * 1. Find source day and destination day (column or card)
   * 2. Enforce soft cap per day
   * 3. Remove activity from source and insert into destination at correct index
   */
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // 1) Find the day containing the dragged activity
    const srcDay = days.find((d) =>
      d.activities.some((a) => a.id === active.id)
    );
    if (!srcDay) return;

    // 2) Determine destination day:
    //    a) If over.id matches a column id → drop into that day
    //    b) Else if over.id matches an activity id → drop relative to that card
    let dstDay = days.find((d) => d.id === over.id);
    let insertIndex: number;

    if (dstDay) {
      // dropped onto empty area of column → append
      insertIndex = dstDay.activities.length;
    } else {
      // dropped onto a specific card
      dstDay = days.find((d) =>
        d.activities.some((a) => a.id === over.id)
      );
      if (!dstDay) return;
      insertIndex = dstDay.activities.findIndex((a) => a.id === over.id);
    }

    // 3) Soft‐cap check
    if (dstDay.activities.length >= MAX_ACTIVITIES_PER_DAY) return;

    // 4) Remove from source day
    const oldIndex = srcDay.activities.findIndex((a) => a.id === active.id);
    if (oldIndex === -1) return;
    const [moved] = srcDay.activities.splice(oldIndex, 1);

    // 5) Insert into destination at computed index
    dstDay.activities.splice(insertIndex, 0, moved);

    // 6) Commit state update
    setDays([...days]);
  }

  /** Add a new empty day at the end */
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

  /** Remove a day by id */
  function removeDay(id: string) {
    setDays(days.filter((d) => d.id !== id));
  }

  return {
    days,
    setDays,
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    addDay,
    removeDay,
  };
}
