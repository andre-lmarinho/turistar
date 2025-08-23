// src/features/planner/services/buildDaysFromInspirationData.ts

import { formatDayPlan } from '@/features/planner/services';
import type { Activity, DayPlan } from '@/shared/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/shared/constants';
import type { CategoryKey } from '@/shared/constants';

/**
 * Converts raw inspiration JSON data into a DayPlan array.
 * Each activity receives a generated id based on its day and index.
 */
export interface InspirationData {
  destination: string;
  budget?: {
    currency: string;
    amount: number;
  };
  expenses?: Array<{
    description: string;
    category: CategoryKey;
    amount: number;
  }>;
  itinerary: Array<{
    day: number;
    activities: Array<{
      title: string;
      startTime: string;
      duration: number;
      address: string;
      budget?: number;
      imageUrl?: string;
      color?: string;
      latitude?: number;
      longitude?: number;
    }>;
  }>;
}

export function buildDaysFromInspirationData(data: InspirationData): DayPlan[] {
  const start = new Date();
  const prefix = data.destination?.slice(0, 2).toLowerCase() || 'x';

  return data.itinerary.map((d, i) => {
    const { id, label } = formatDayPlan(new Date(start.getTime() + i * 86400000));
    const activities: Activity[] = d.activities.map((a, idx) => ({
      id: `${prefix}${i}-${idx}`,
      title: a.title,
      startTime: a.startTime,
      duration: a.duration,
      address: a.address,
      imageUrl: a.imageUrl ?? '',
      latitude: a.latitude,
      longitude: a.longitude,
      color: a.color ?? DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
      budget: a.budget,
    }));
    return { id, label, activities };
  });
}
