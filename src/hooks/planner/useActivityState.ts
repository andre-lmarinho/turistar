// src/hooks/useActivityState.ts
'use client';

import type { Activity, DayPlan } from '@/types';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_ADD_ACTIVITY_COLOR_INDEX,
  DEFAULT_COLORS,
} from '@/constants';

export function useActivityState(setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>) {
  function addActivity(act: Activity, dayIndex = 0): void {
    setDays((prev) => {
      const copy = [...prev];
      if (!copy[dayIndex]) {
        copy[dayIndex] = { id: `temp-${Date.now()}`, label: `Day ${dayIndex + 1}`, activities: [] };
      }
      if (!copy[dayIndex].activities.some((a) => a.id === act.id)) {
        copy[dayIndex].activities.push({
          ...act,
          color: DEFAULT_COLORS[DEFAULT_ADD_ACTIVITY_COLOR_INDEX],
        });
      }
      return copy;
    });
  }

  function removeActivity(id: string): void {
    setDays((prev) =>
      prev.map((day) => ({ ...day, activities: day.activities.filter((a) => a.id !== id) }))
    );
  }

  function updateActivity(id: string, patch: Partial<Activity>): void {
    setDays((prev) =>
      prev.map((day) =>
        day.activities.some((a) => a.id === id)
          ? {
              ...day,
              activities: day.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
            }
          : day
      )
    );
  }

  function addBlankActivity(dayIndex = 0, insertIndex?: number): Activity {
    const blank: Activity = {
      id: `blank-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      description: '',
      duration: 0,
      color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
      budget: 0,
      category: '',
    };
    setDays((prev) => {
      const copy = [...prev];
      if (!copy[dayIndex])
        copy[dayIndex] = { id: `temp-${Date.now()}`, label: `Day ${dayIndex + 1}`, activities: [] };
      const acts = copy[dayIndex].activities;
      if (insertIndex == null || insertIndex < 0 || insertIndex > acts.length) acts.push(blank);
      else acts.splice(insertIndex, 0, blank);
      return copy;
    });
    return blank;
  }

  return { addActivity, removeActivity, updateActivity, addBlankActivity };
}
