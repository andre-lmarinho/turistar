// src/hooks/useDnDPlanner.ts
'use client';

import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { DayPlan, Activity } from '@/types/itinerary';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_ADD_ACTIVITY_COLOR_INDEX,
  DEFAULT_COLORS,
} from '@/constants/colors';

/**
 * Encapsulates:
 *   • full DayPlan state
 *   • drag-and-drop handlers
 *   • CRUD helpers   (add / remove / **update**)
 */
export function useDnDPlanner(initial: DayPlan[] = []) {
  const [days, setDays] = useState<DayPlan[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ------------------------------- sensors ------------------------------ */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

    setDays((prev) => {
      // 1) clone days e cada activities
      const daysCopy = prev.map((d) => ({
        ...d,
        activities: [...d.activities],
      }));

      // 2) encontrar índices
      const srcDayIdx = daysCopy.findIndex((d) => d.activities.some((a) => a.id === active.id));
      const dstDayIdx = daysCopy.findIndex(
        (d) => d.id === over.id || d.activities.some((a) => a.id === over.id)
      );
      if (srcDayIdx < 0 || dstDayIdx < 0) return prev;

      const srcActivities = daysCopy[srcDayIdx].activities;
      const dstActivities = daysCopy[dstDayIdx].activities;

      const oldIdx = srcActivities.findIndex((a) => a.id === active.id);
      const overIdx =
        daysCopy[dstDayIdx].id === over.id
          ? dstActivities.length
          : dstActivities.findIndex((a) => a.id === over.id);

      // 3) faz o movimento sem mutar prev
      let moved: Activity;
      if (srcDayIdx === dstDayIdx) {
        daysCopy[srcDayIdx].activities = arrayMove(srcActivities, oldIdx, overIdx);
      } else {
        [moved] = srcActivities.splice(oldIdx, 1);
        dstActivities.splice(overIdx, 0, moved);
      }

      return daysCopy;
    });
  }

  /* --------------------------- add / remove ----------------------------- */
  function addActivity(act: Activity, dayIndex = 0) {
    setDays((prev) => {
      const copy = [...prev];
      /* ensure target column exists */
      if (!copy[dayIndex])
        copy[dayIndex] = {
          id: `temp-${Date.now()}`,
          label: `Day ${dayIndex + 1}`,
          activities: [],
        };
      /* allow same place on another day, but never twice in this day */
      const alreadyInDay = copy[dayIndex].activities.some((a) => a.id === act.id);
      if (!alreadyInDay) {
        copy[dayIndex].activities.push({
          ...act,
          color: DEFAULT_COLORS[DEFAULT_ADD_ACTIVITY_COLOR_INDEX], // Apply default color for addActivity
        });
      }
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

  /* ------------------------------ update -------------------------------- */
  /**
   * Patch an existing activity (title, description, color, …).
   * Returns silently if the id is not found.
   *
   * @param id     activity id to update
   * @param patch  partial Activity with the fields you want to change
   */
  function updateActivity(id: string, patch: Partial<Activity>) {
    setDays((prev) =>
      prev.map((day) => {
        const has = day.activities.some((a) => a.id === id);
        if (!has) return day; // nothing in this column

        /* create NEW objects to keep state immutable */
        return {
          ...day,
          activities: day.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        };
      })
    );
  }

  /* ------------------------- blank activity  --------------------------- */
  /**
   * Pushes a completely blank activity onto the given day (by index).
   * Returns the newly created Activity so the caller can e.g. open an editor.
   */
  function addBlankActivity(dayIndex = 0): Activity {
    const blank: Activity = {
      id: `blank-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      description: '',
      duration: 0,
      color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
    };
    setDays((prev) => {
      const copy = [...prev];
      if (!copy[dayIndex]) {
        copy[dayIndex] = {
          id: `temp-${Date.now()}`,
          label: `Day ${dayIndex + 1}`,
          activities: [],
        };
      }
      copy[dayIndex].activities.push(blank);
      return copy;
    });
    return blank;
  }

  /* --------------------------------------------------------------------- */
  return {
    days,
    sensors,
    activeId,
    /* dnd */
    handleDragStart,
    handleDragOver,
    /* external mutators */
    setDays,
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
  };
}
