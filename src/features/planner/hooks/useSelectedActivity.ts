// src/features/planner/hooks/useSelectedActivity.ts
'use client';

import { useState } from 'react';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import {
  BLANK_ACTIVITY_PREFIX,
  isBlankActivityTitle,
} from '@/features/planner/domain/utils/activityPlaceholders';
import { moveActivityToDay } from '@/features/planner/services/moveActivityToDay';
import { moveActivityPosition } from '@/features/planner/services/moveActivityPosition';

/**
 * Manages the currently selected activity for editing in the planner.
 *
 * - Stores and updates the selected activity, including temporary or blank ones.
 * - Handles saving, deleting, and canceling edits.
 * - Supports changing the activity’s assigned day and color.
 * - Integrates with external day/activity state via provided functions.
 *
 * This hook helps coordinate modal-based editing while keeping the main planner state in sync.
 */

interface UseSelectedActivityOptions {
  addActivity: (act: Activity, dayIndex?: number) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  addBlankActivity: (dayIndex?: number, insertIndex?: number) => Activity;
}

export function useSelectedActivity(
  days: DayPlan[],
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>,
  { addActivity, removeActivity, updateActivity, addBlankActivity }: UseSelectedActivityOptions
) {
  const [selectedActivity, setSelectedActivity] = useState<(Activity & { dayId?: string }) | null>(
    null
  );

  const changeDay = (activityId: string, dayId: string) => {
    setDays((prev) => moveActivityToDay(prev, activityId, dayId));
    setSelectedActivity((prev) => (prev ? { ...prev, dayId } : prev));
  };

  const addBlankAndSelect = (dayId: string, insertIdx?: number) => {
    const dayIndex = days.findIndex((d) => d.id === dayId);
    const blank = addBlankActivity(dayIndex, insertIdx);
    setSelectedActivity({ ...blank, dayId });
  };

  const removePlaceholderFromDay = (dayId: string, candidateId: string): boolean => {
    let removed = false;
    setDays((prev) => {
      if (removed) return prev;
      const next = prev.map((day) => {
        if (day.id !== dayId || removed) return day;
        const activities = day.activities.filter((activity) => {
          if (removed) return true;
          if (activity.id === candidateId) {
            removed = true;
            return false;
          }
          if (isBlankActivityTitle(activity.title)) {
            removed = true;
            return false;
          }
          return true;
        });
        return removed ? { ...day, activities } : day;
      });
      return removed ? next : prev;
    });
    return removed;
  };

  const closeModal = () => {
    if (selectedActivity && isBlankActivityTitle(selectedActivity.title)) {
      const { id, dayId } = selectedActivity;
      if (id.startsWith(BLANK_ACTIVITY_PREFIX)) {
        removeActivity(id);
      } else if (!dayId || !removePlaceholderFromDay(dayId, id)) {
        removeActivity(id);
      }
    }
    setSelectedActivity(null);
  };

  const save = (patch: Partial<Activity>) => {
    if (!selectedActivity || !patch.title?.trim()) return;
    if (selectedActivity.id.startsWith('temp-')) {
      addActivity(
        { ...selectedActivity, ...patch, duration: Number(patch.duration) },
        days.findIndex((d) => d.id === selectedActivity.dayId)
      );
    } else {
      updateActivity(selectedActivity.id, { ...patch, duration: Number(patch.duration) });
    }
    setSelectedActivity(null);
  };

  const deleteActivityById = () => {
    if (!selectedActivity) return;
    removeActivity(selectedActivity.id);
    setSelectedActivity(null);
  };

  const changeColor = (activityId: string, newColor: string) => {
    setSelectedActivity((prev) =>
      prev && prev.id === activityId ? { ...prev, color: newColor } : prev
    );
    if (!activityId.startsWith('temp-')) {
      updateActivity(activityId, { color: newColor });
    }
  };

  const changePosition = (activityId: string, newIndex: number) => {
    setDays((prev) => moveActivityPosition(prev, activityId, newIndex));
  };

  return {
    selectedActivity,
    setSelectedActivity,
    changeDay,
    changePosition,
    addBlankAndSelect,
    closeModal,
    save,
    deleteActivity: deleteActivityById,
    changeColor,
  };
}

export type UseSelectedActivityReturn = ReturnType<typeof useSelectedActivity>;
