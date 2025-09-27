// src/features/planner/hooks/useSelectedActivity.ts
'use client';

import { useRef, useState } from 'react';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import {
  BLANK_ACTIVITY_PREFIX,
  generateClientActivityId,
  isPlaceholderActivity,
} from '@/features/planner/domain/utils/activityPlaceholders';
import {
  DEFAULT_COLORS,
  DEFAULT_NEW_CARD_COLOR_INDEX,
} from '@/features/planner/domain/constants/colors';
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
    const blank: Activity = {
      id: `${BLANK_ACTIVITY_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      description: '',
      duration: 0,
      color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
      budget: 0,
      category: '',
    };

    newActivityMetaRef.current = { dayId, insertIndex: insertIdx };
    setSelectedActivity({ ...blank, dayId });
  };

  const closeModal = () => {
    const pendingMeta = newActivityMetaRef.current;
    if (selectedActivity && pendingMeta && selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
      newActivityMetaRef.current = null;
      setSelectedActivity(null);
      return;
    }

    if (selectedActivity && isPlaceholderActivity(selectedActivity)) {
      removeActivity(selectedActivity.id);
    }
    newActivityMetaRef.current = null;
    setSelectedActivity(null);
  };

  const save = (patch: Partial<Activity>) => {
    if (!selectedActivity || !patch.title?.trim()) return;
    const pendingMeta = newActivityMetaRef.current;
    const sanitized = { ...patch, duration: Number(patch.duration) };
    const dayIndex = days.findIndex((d) => d.id === selectedActivity.dayId);
    if (pendingMeta && selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
      const targetDayId = selectedActivity.dayId ?? pendingMeta.dayId;
      const dayIndex = days.findIndex((d) => d.id === targetDayId);
      if (dayIndex === -1) {
        setSelectedActivity(null);
        newActivityMetaRef.current = null;
        return;
      }
      const placeholderIndex = pendingMeta.insertIndex ?? days[dayIndex].activities.length;
      const { dayId: _omitDayId, ...activityBase } = {
        ...selectedActivity,
        ...sanitized,
        id: generateClientActivityId(),
      };
      void _omitDayId;
      addActivity(activityBase, dayIndex, placeholderIndex === -1 ? undefined : placeholderIndex);
      newActivityMetaRef.current = null;
    } else if (selectedActivity.id.startsWith('temp-')) {
      if (dayIndex === -1) {
        newActivityMetaRef.current = null;
        setSelectedActivity(null);
        return;
      }
      const { dayId: _omitDayId, ...activityBase } = { ...selectedActivity, ...sanitized };
      void _omitDayId;
      addActivity(activityBase, dayIndex);
    } else {
      updateActivity(selectedActivity.id, sanitized);
    }
    setSelectedActivity(null);
  };

  const deleteActivityById = () => {
    if (!selectedActivity) return;
    const pendingMeta = newActivityMetaRef.current;
    if (pendingMeta && selectedActivity.id.startsWith(BLANK_ACTIVITY_PREFIX)) {
      newActivityMetaRef.current = null;
      setSelectedActivity(null);
      return;
    }
    removeActivity(selectedActivity.id);
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
    closeModal,
    save,
    deleteActivity: deleteActivityById,
    changeColor,
  };
}

export type UseSelectedActivityReturn = ReturnType<typeof useSelectedActivity>;
