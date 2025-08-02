// src/hooks/useCatalog.ts
'use client';

import { useMemo } from 'react';
import { Activity, DayPlan } from '@/types';
import { useCatalogActivities } from './useCatalogActivities';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';

/**
 * Hook to format cached catalog activities into day buckets.
 * @param planId - planner identifier used for the storage key
 * @param options.enabled - whether to load the cached data
 * - Splits activities into days, 3 per day
 * - Returns loading and error flags from `useCatalogActivities`
 */

export function useCatalog(
  planId: string | null,
  dest: string | null,
  options: { enabled: boolean }
) {
  // 1) Load catalog activities using the shared hook
  const { activities, ...query } = useCatalogActivities(planId, dest, options);

  // 2) Memoize transforming raw activities into day-based buckets
  const days: DayPlan[] | undefined = useMemo(() => {
    if (!activities) return;

    const chunkSize = 3;
    const dayPlans: DayPlan[] = [];

    activities.forEach((activity, i) => {
      const dayIndex = Math.floor(i / chunkSize);
      if (!dayPlans[dayIndex]) {
        dayPlans[dayIndex] = {
          id: `day-${dayIndex + 1}`,
          label: `Day ${dayIndex + 1}`,
          activities: [],
        };
      }
      const mapped: Activity = {
        id: activity.id,
        title: activity.name,
        imageUrl: activity.imageUrl,
        color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
        startTime: '',
        budget: 0,
        category: activity.category,
      };

      dayPlans[dayIndex].activities.push(mapped);
    });

    return dayPlans;
  }, [activities]);

  // 3) Expose both the formatted days and all React Query state
  return { days, ...query };
}
