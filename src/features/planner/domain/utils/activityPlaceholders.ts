// src/features/planner/domain/utils/activityPlaceholders.ts

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

export const BLANK_ACTIVITY_PREFIX = 'blank-';

export function isBlankActivityTitle(title: string | undefined | null): boolean {
  return !title || title.trim().length === 0;
}

export function isPlaceholderActivity(activity: Pick<Activity, 'id' | 'title'>): boolean {
  return activity.id.startsWith(BLANK_ACTIVITY_PREFIX) || isBlankActivityTitle(activity.title);
}

export function generatePlaceholderActivityId(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return `${BLANK_ACTIVITY_PREFIX}${crypto.randomUUID()}`;
  const suffix = Math.random().toString(36).slice(2, 10);
  return `${BLANK_ACTIVITY_PREFIX}${suffix}`;
}

export function generateClientActivityId(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `act-${Math.random().toString(36).slice(2, 10)}`;
}
