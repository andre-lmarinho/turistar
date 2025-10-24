'use client';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { getDefaultActivityColor } from '@/features/planner/domain/constants/colors';
import { createBlankActivity } from '@/features/planner/domain/utils/activityPlaceholders';
import { sanitizeActivityTitle } from '@/features/planner/domain/utils/sanitizeActivityTitle';
import { midpoint, normalizePositions } from '@/features/planner/domain/events/gapOrdering';

type ActivityWithMeta = Activity & {
  _optimistic?: boolean;
  _tempId?: string;
};

function resolveDayIndex(days: DayPlan[], dayId: string): number {
  return days.findIndex((day) => day.id === dayId);
}

function computeInsertPosition(
  activities: Activity[],
  insertIndex?: number
): { boundedIndex: number; position: string } {
  const snapshot = normalizePositions(activities.map((activity) => ({ ...activity })));
  const maxIndex = activities.length;
  const boundedIndex =
    insertIndex == null || Number.isNaN(insertIndex)
      ? maxIndex
      : Math.max(0, Math.min(insertIndex, maxIndex));
  const leftNeighbor = snapshot[boundedIndex - 1];
  const rightNeighbor = snapshot[boundedIndex];
  const position = midpoint(leftNeighbor?.position, rightNeighbor?.position);
  return { boundedIndex, position };
}

type NormalizeActivityOptions = {
  existing?: ActivityWithMeta;
  fallbackPosition?: string;
};

function normalizeActivityForState(
  activity: Activity | ActivityWithMeta,
  { existing, fallbackPosition }: NormalizeActivityOptions = {}
): ActivityWithMeta {
  const incoming = activity as ActivityWithMeta;
  const normalized: ActivityWithMeta = {
    ...(existing ?? {}),
    ...incoming,
    title: sanitizeActivityTitle(incoming.title ?? existing?.title),
    color: incoming.color || existing?.color || getDefaultActivityColor(),
    position: incoming.position ?? fallbackPosition ?? existing?.position,
  };

  const optimistic = incoming._optimistic || existing?._optimistic;
  if (optimistic) normalized._optimistic = optimistic;
  else delete normalized._optimistic;

  const tempId = incoming._tempId || existing?._tempId;
  if (tempId) normalized._tempId = tempId;
  else delete normalized._tempId;

  return normalized;
}

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
      const nextActivity = normalizeActivityForState(act);
      const activities = copy[dayIndex].activities;
      if (!activities.some((a) => a.id === act.id)) {
        if (insertIndex == null || insertIndex < 0 || insertIndex > activities.length) {
          activities.push(nextActivity);
        } else {
          activities.splice(insertIndex, 0, nextActivity);
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
                        patch.title !== undefined
                          ? sanitizeActivityTitle(patch.title, a.title)
                          : a.title,
                    }
                  : a
              ),
            }
          : day
      )
    );
  }

  function addBlankActivity(dayIndex = 0, insertIndex?: number): Activity {
    const blank = createBlankActivity();
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

  function insertActivityAt(
    dayId: string,
    activity: ActivityWithMeta,
    insertIndex?: number
  ): ActivityWithMeta | null {
    let inserted: ActivityWithMeta | null = null;
    setDays((prev) => {
      const dayIdx = resolveDayIndex(prev, dayId);
      if (dayIdx === -1) return prev;
      const next = [...prev];
      const day = next[dayIdx];
      const activities = [...day.activities];
      const { boundedIndex, position } = computeInsertPosition(activities, insertIndex);
      const existingIndex = activities.findIndex((a) => a.id === activity.id);
      if (existingIndex >= 0) {
        const merged = normalizeActivityForState(activity, {
          existing: activities[existingIndex] as ActivityWithMeta,
          fallbackPosition: position,
        });
        activities[existingIndex] = merged;
        inserted = merged;
      } else {
        const normalized = normalizeActivityForState(activity, { fallbackPosition: position });
        activities.splice(boundedIndex, 0, normalized);
        inserted = normalized;
      }
      next[dayIdx] = { ...day, activities };
      return next;
    });
    return inserted;
  }

  function replaceActivity(dayId: string, targetId: string, nextActivity: ActivityWithMeta): void {
    setDays((prev) => {
      let targetDayIdx = resolveDayIndex(prev, dayId);
      let targetActivityIndex = -1;

      if (targetDayIdx !== -1) {
        targetActivityIndex = prev[targetDayIdx].activities.findIndex(
          (activity) => activity.id === targetId
        );
      }

      if (targetActivityIndex === -1) {
        targetDayIdx = prev.findIndex((day) =>
          day.activities.some((activity) => activity.id === targetId)
        );
        if (targetDayIdx === -1) return prev;
        targetActivityIndex = prev[targetDayIdx].activities.findIndex(
          (activity) => activity.id === targetId
        );
        if (targetActivityIndex === -1) return prev;
      }

      const day = prev[targetDayIdx];
      const activities = [...day.activities];
      const current = activities[targetActivityIndex] as ActivityWithMeta;
      const merged = normalizeActivityForState(nextActivity, { existing: current });
      delete merged._tempId;
      delete merged._optimistic;

      const next = [...prev];
      const updatedActivities = [...activities];
      updatedActivities[targetActivityIndex] = merged;
      next[targetDayIdx] = { ...day, activities: updatedActivities };
      return next;
    });
  }

  return {
    addActivity,
    removeActivity,
    updateActivity,
    addBlankActivity,
    insertActivityAt,
    replaceActivity,
  };
}
