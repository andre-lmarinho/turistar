'use client';

import { useRef, useState } from 'react';
import type { Activity, DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import {
  BLANK_ACTIVITY_PREFIX,
  generateClientActivityId,
  createBlankActivity,
  isPlaceholderActivity,
} from '@/features/app/planner/domain/utils/activityPlaceholders';
import { moveActivityToDay } from '@/features/app/planner/services/activities/moveActivityToDay';
import { moveActivityPosition } from '@/features/app/planner/services/activities/moveActivityPosition';

/**
 * Manages the currently selected activity for editing in the planner.
 *
 * - Stores and updates the selected activity, including temporary or blank ones.
 * - Handles saving, deleting, and canceling edits.
 * - Supports changing the activity’s assigned day and color.
 * - Integrates with external day/activity state via provided functions.
 *
 * This hook helps coordinate dialog-based editing while keeping the main planner state in sync.
 */

interface UseSelectedActivityOptions {
  addActivity: (act: Activity, dayIndex?: number, insertIndex?: number) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
}

type SelectedActivityState = (Activity & { dayId?: string }) | null;

type NewActivityMeta = { dayId: string; insertIndex?: number } | null;

export function useSelectedActivity(
  days: DayPlan[],
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>,
  { addActivity, removeActivity, updateActivity }: UseSelectedActivityOptions
) {
  const [selectedActivityState, setSelectedActivityState] = useState<SelectedActivityState>(null);
  const newActivityMetaRef = useRef<NewActivityMeta>(null);
  const savingRef = useRef(false);

  const setSelectedActivity = (
    value: SelectedActivityState | ((prev: SelectedActivityState) => SelectedActivityState)
  ) => {
    setSelectedActivityState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (!next || !next.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
        newActivityMetaRef.current = null;
      }
      return next;
    });
  };

  const selectedActivity = selectedActivityState;

  const changeDay = (activityId: string, dayId: string) => {
    const pendingMeta = newActivityMetaRef.current;
    const isPendingNew = pendingMeta && selectedActivity && selectedActivity.id === activityId;

    if (isPendingNew) {
      const targetDay = days.find((d) => d.id === dayId);
      newActivityMetaRef.current = {
        dayId,
        insertIndex: targetDay ? targetDay.activities.length : undefined,
      };
      setSelectedActivity((prev) => (prev ? { ...prev, dayId } : prev));
      return;
    }

    const existsInState = days.some((day) =>
      day.activities.some((activity) => activity.id === activityId)
    );

    if (existsInState) {
      setDays((prev) => moveActivityToDay(prev, activityId, dayId));
    }
    setSelectedActivity((prev) => (prev ? { ...prev, dayId } : prev));
  };

  const addBlankAndSelect = (dayId: string, insertIdx?: number) => {
    const blank = createBlankActivity();

    newActivityMetaRef.current = { dayId, insertIndex: insertIdx };
    setSelectedActivity({ ...blank, dayId });
  };

  const removePlaceholderFromPlanner = (activityId: string) => {
    if (!activityId.startsWith(BLANK_ACTIVITY_PREFIX)) return;
    setDays((prev) => {
      let removed = false;
      const next = prev.map((day) => {
        if (!day.activities.some((activity) => activity.id === activityId)) return day;
        removed = true;
        return {
          ...day,
          activities: day.activities.filter((activity) => activity.id !== activityId),
        };
      });
      return removed ? next : prev;
    });
  };

  const closeDialog = () => {
    const pendingMeta = newActivityMetaRef.current;
    if (selectedActivity && pendingMeta && selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
      newActivityMetaRef.current = null;
      setSelectedActivity(null);
      return;
    }

    if (selectedActivity) {
      if (selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
        removePlaceholderFromPlanner(selectedActivity.id);
      } else if (isPlaceholderActivity(selectedActivity)) {
        removeActivity(selectedActivity.id);
      }
    }
    newActivityMetaRef.current = null;
    setSelectedActivity(null);
  };

  const save = (patch: Partial<Activity>) => {
    if (!selectedActivity || !patch.title?.trim()) return;
    if (savingRef.current) return;

    savingRef.current = true;
    try {
      const pendingMeta = newActivityMetaRef.current;
      const sanitized = { ...patch, duration: Number(patch.duration) };
      const currentDayIndex = days.findIndex((d) => d.id === selectedActivity.dayId);

      if (pendingMeta && selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
        const targetDayId = selectedActivity.dayId ?? pendingMeta.dayId;
        const resolvedDayIndex = days.findIndex((d) => d.id === targetDayId);
        if (resolvedDayIndex === -1) {
          return;
        }
        const placeholderIndex =
          pendingMeta.insertIndex ?? days[resolvedDayIndex].activities.length;
        const { dayId: _omitDayId, ...activityBase } = {
          ...selectedActivity,
          ...sanitized,
          id: generateClientActivityId(),
        };
        void _omitDayId;
        addActivity(
          activityBase,
          resolvedDayIndex,
          placeholderIndex === -1 ? undefined : placeholderIndex
        );
        return;
      }

      if (selectedActivity.id.startsWith('temp-')) {
        if (currentDayIndex === -1) {
          return;
        }
        const { dayId: _omitDayId, ...activityBase } = { ...selectedActivity, ...sanitized };
        void _omitDayId;
        addActivity(activityBase, currentDayIndex);
        return;
      }

      updateActivity(selectedActivity.id, sanitized);
    } finally {
      savingRef.current = false;
      newActivityMetaRef.current = null;
      setSelectedActivity(null);
    }
  };

  const deleteActivityById = () => {
    if (!selectedActivity) return;
    const pendingMeta = newActivityMetaRef.current;
    if (pendingMeta && selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
      newActivityMetaRef.current = null;
      setSelectedActivity(null);
      return;
    }
    if (selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
      removePlaceholderFromPlanner(selectedActivity.id);
    } else {
      removeActivity(selectedActivity.id);
    }
    newActivityMetaRef.current = null;
    setSelectedActivity(null);
  };

  const changeColor = (activityId: string, newColor: string) => {
    setSelectedActivity((prev) =>
      prev && prev.id === activityId ? { ...prev, color: newColor } : prev
    );
    const pendingMeta = newActivityMetaRef.current;
    if ((!pendingMeta || activityId !== selectedActivity?.id) && !activityId.startsWith('temp-')) {
      updateActivity(activityId, { color: newColor });
    }
  };

  const changePosition = (activityId: string, newIndex: number) => {
    const pendingMeta = newActivityMetaRef.current;
    const isPendingNew = pendingMeta && selectedActivity && selectedActivity.id === activityId;

    if (isPendingNew) {
      newActivityMetaRef.current = { ...pendingMeta, insertIndex: newIndex };
      return;
    }

    setDays((prev) => moveActivityPosition(prev, activityId, newIndex));
  };

  return {
    selectedActivity,
    setSelectedActivity,
    changeDay,
    changePosition,
    addBlankAndSelect,
    closeDialog,
    save,
    deleteActivity: deleteActivityById,
    changeColor,
  };
}
