// src/hooks/useCatalog.ts

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Activity, DayPlan } from '@/types';

interface CatalogResponse {
  activities: Activity[];
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
      dayPlans[dayIndex].activities.push({
        ...activity,
        budget: activity.budget ?? 0,
      });
    });

    return dayPlans;
  }, [query.data]);

  // 3) Expose both the formatted days and all React Query state
  return { days, ...query };
}
