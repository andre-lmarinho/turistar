// src/features/planner/hooks/useActivityState.ts
'use client';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_COLORS,
} from '@/features/planner/domain/constants/colors';
import { generatePlaceholderActivityId } from '@/features/planner/domain/utils/activityPlaceholders';

/**
 * Provides helpers for modifying day activities.
 * - Adds, removes or updates activities in the given days state.
 * - Can insert a blank placeholder activity.
 */

export function useActivityState(setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>) {
  function addActivity(act: Activity, dayIndex = 0, insertIndex?: number): void {
    setDays((prev) => {
      const copy = [...prev];
      if (!copy[dayIndex]) {
        copy[dayIndex] = { id: `temp-${Date.now()}`, label: `Day ${dayIndex + 1}`, activities: [] };
      }
      const sanitizedTitle = act.title?.trim() ?? '';
      const nextActivity = {
        ...act,
        title: sanitizedTitle.length > 0 ? sanitizedTitle : 'Untitled activity',
        color: act.color || DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
      };
      const activities = copy[dayIndex].activities;
      if (!activities.some((a) => a.id === act.id)) {
        if (insertIndex == null || insertIndex < 0 || insertIndex > activities.length) {
          activities.push({
            ...nextActivity,
          });
        } else {
          activities.splice(insertIndex, 0, {
            ...nextActivity,
          });
        }
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
              activities: day.activities.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      ...patch,
                      title:
                        patch.title && patch.title.trim().length > 0 ? patch.title.trim() : a.title,
                    }
                  : a
              ),
            }
          : day
      )
    );
  }

  function addBlankActivity(dayIndex = 0, insertIndex?: number): Activity {
    const blank: Activity = {
      id: generatePlaceholderActivityId(),
      title: '',
      description: '',
      duration: 0,
      color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
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
