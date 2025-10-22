'use client';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_COLORS,
} from '@/features/planner/domain/constants/colors';
import { generatePlaceholderActivityId } from '@/features/planner/domain/utils/activityPlaceholders';
import { midpoint, normalizePositions } from '@/features/planner/domain/events/gapOrdering';

type ActivityWithMeta = Activity & {
  _optimistic?: boolean;
  _tempId?: string;
};

function sanitizeTitle(title: string | undefined): string {
  const trimmed = title?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : 'Untitled activity';
}

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
    title: sanitizeTitle(incoming.title ?? existing?.title),
    color: incoming.color || existing?.color || DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
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
      const dayIdx = resolveDayIndex(prev, dayId);
      if (dayIdx === -1) return prev;
      const day = prev[dayIdx];
      const activities = [...day.activities];
      const index = activities.findIndex((activity) => activity.id === targetId);
      if (index === -1) return prev;

      const current = activities[index] as ActivityWithMeta;
      const merged = normalizeActivityForState(nextActivity, { existing: current });
      delete merged._tempId;
      delete merged._optimistic;

      const next = [...prev];
      const updatedActivities = [...activities];
      updatedActivities[index] = merged;
      next[dayIdx] = { ...day, activities: updatedActivities };
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
