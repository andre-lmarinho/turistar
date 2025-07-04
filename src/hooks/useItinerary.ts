// src/hooks/useItinerary.ts

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Activity, DayPlan } from '@/types/itinerary';

interface ItineraryResponse {
  activities: Activity[];
}

// Type guard to check that the data has an activities array
const hasActivities = (data: unknown): data is ItineraryResponse =>
  !!data && typeof data === 'object' && Array.isArray((data as ItineraryResponse).activities);

/**
 * Hook to fetch and format itinerary by destination.
 * - Fetches /api/itinerary?dest=… when `dest` is truthy
 * - Splits activities into days, 3 per day
 * - Returns both React Query props and `days` as DayPlan[]
 */
export function useItinerary(dest: string | null) {
  // 1) Run the query only if we have a dest
  const query = useQuery({
    queryKey: ['itinerary', dest],
    enabled: !!dest,
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?dest=${dest}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch itinerary: HTTP ${res.status}`);
      }
      return res.json();
    },
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
      dayPlans[dayIndex].activities.push(activity);
    });

    return dayPlans;
  }, [query.data]);

  // 3) Expose both the formatted days and all React Query state
  return { days, ...query };
}
