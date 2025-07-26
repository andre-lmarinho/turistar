// src/hooks/useCatalog.ts

import { useMemo } from 'react';
import { Activity, DayPlan } from '@/types';
import { useCatalogActivities } from '@/hooks';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';

/**
 * Hook to fetch and format catalog by destination.
 * @param dest - destination string
 * @param options.enabled - whether to enable the query
 * - Fetches /api/catalog?dest=… when enabled
 * - Splits activities into days, 3 per day
 * - Returns both React Query props and `days` as DayPlan[]
 */

export function useCatalog(dest: string | null, options: { enabled: boolean }) {
  // 1) Load catalog activities using the shared hook
  const { activities, ...query } = useCatalogActivities(dest, options);

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
        color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
        description: activity.description,
        duration: activity.duration,
        startTime: '',
        imageUrl: activity.image_url,
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
