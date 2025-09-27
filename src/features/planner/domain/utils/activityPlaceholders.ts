// src/features/planner/domain/utils/activityPlaceholders.ts

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

export const BLANK_ACTIVITY_PREFIX = 'blank-';

export function isBlankActivityTitle(title: string | undefined | null): boolean {
  return !title || title.trim().length === 0;
}

export function isPlaceholderActivity(activity: Pick<Activity, 'id' | 'title'>): boolean {
  return activity.id.startsWith(BLANK_ACTIVITY_PREFIX) || isBlankActivityTitle(activity.title);
}
