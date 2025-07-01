// src/hooks/useDnDPlanner.ts
"use client";

import {
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { formatISO } from "date-fns";
import { useState } from "react";

import { DayPlan } from "@/types/itinerary";

export function useDnDPlanner(initial: DayPlan[] = []) {
  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */
  const [days, setDays]   = useState<DayPlan[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Sensors                                                           */
  /* ------------------------------------------------------------------ */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */
  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  /** Real-time list re-ordering */
  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    /* locate source & destination columns */
    const srcIdx = days.findIndex(d => d.activities.some(a => a.id === active.id));
    const dstIdx = days.findIndex(
      d => d.id === over.id || d.activities.some(a => a.id === over.id)
    );
    if (srcIdx === -1 || dstIdx === -1) return;

    const srcDay = days[srcIdx];
    const dstDay = days[dstIdx];

    /* indexes inside their respective arrays */
    const oldIdx = srcDay.activities.findIndex(a => a.id === active.id);
    const overIdx =
      dstDay.id === over.id              // dropped on column body
        ? dstDay.activities.length
        : dstDay.activities.findIndex(a => a.id === over.id);

    if (srcIdx === dstIdx) {
      // move within same column
      srcDay.activities = arrayMove(srcDay.activities, oldIdx, overIdx);
    } else {
      // move across columns
      const [moved] = srcDay.activities.splice(oldIdx, 1);
      dstDay.activities.splice(overIdx, 0, moved);
    }

    setDays([...days]);
  }

  /** Finalise drag (all moves already done in dragOver) */
  function handleDragEnd(_: DragEndEvent) {
    setActiveId(null);
  }

  /* ------------------------------------------------------------------ */
  /*  Day helpers                                                       */
  /* ------------------------------------------------------------------ */
  function addDay(date: Date) {
    const iso = formatISO(date, { representation: "date" });
    if (days.some(d => d.id === iso)) return;

    setDays([
      ...days,
      {
        id: iso,
        label: date.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" }),
        activities: [],
      },
    ]);
  }

  function removeDay(id: string) {
    setDays(days.filter(d => d.id !== id));
  }

  /* ------------------------------------------------------------------ */
  /*  Exposed API                                                       */
  /* ------------------------------------------------------------------ */
  return {
    days,
    setDays,
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,   // expose for <DndContext onDragOver={...} />
    handleDragEnd,
    addDay,
    removeDay,
  };
}
