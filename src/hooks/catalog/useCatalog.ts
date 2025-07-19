// src/hooks/catalog/useCatalog.ts

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Activity, CatalogActivity, DayPlan } from '@/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';

interface CatalogResponse {
  activities: CatalogActivity[];
}

// Type guard to check that the data has an activities array
const hasActivities = (data: unknown): data is CatalogResponse =>
  !!data && typeof data === 'object' && Array.isArray((data as CatalogResponse).activities);

/**
 * Hook to fetch and format catalog by destination.
 * @param dest - destination string
 * @param options.enabled - whether to enable the query
 * - Fetches /api/catalog?dest=… when enabled
 * - Splits activities into days, 3 per day
 * - Returns both React Query props and `days` as DayPlan[]
 */
export function useCatalog(dest: string | null, options: { enabled: boolean }) {
  // 1) Run the query only if we have a dest and enabled
  const query = useQuery({
    queryKey: ['catalog', dest],
    queryFn: async () => {
      const res = await fetch(`/api/catalog?dest=${encodeURIComponent(dest || '')}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch catalog: HTTP ${res.status}`);
      }
      return res.json();
    },
    enabled: !!dest && options.enabled,
  });

  // 2) Memoize transforming raw activities into day-based buckets
  const days: DayPlan[] | undefined = useMemo(() => {
    if (!query.data || !hasActivities(query.data)) return;

    const chunkSize = 3;
    const dayPlans: DayPlan[] = [];

    query.data.activities.forEach((activity, i) => {
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
        color: DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX],
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
  }, [query.data]);

  // 3) Expose both the formatted days and all React Query state
  return { days, ...query };
}
