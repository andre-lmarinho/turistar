import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Activity, DayPlan } from "@/types/itinerary";

interface ItineraryResponse {
  activities: Activity[];
}
const hasActivities = (d: unknown): d is ItineraryResponse =>
  !!d &&
  typeof d === "object" &&
  Array.isArray((d as ItineraryResponse).activities);

export function useItinerary(dest: string | null) {
  const query = useQuery({
    queryKey: ["itinerary", dest],
    enabled: !!dest,
    queryFn: async () => {
      const res = await fetch(`/api/itinerary?dest=${dest}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const days: DayPlan[] | undefined = useMemo(() => {
    if (!query.data || !hasActivities(query.data)) return;
    const chunk = 3;
    const tmp: DayPlan[] = [];
    query.data.activities.forEach((act, idx) => {
      const dIdx = Math.floor(idx / chunk);
      if (!tmp[dIdx])
        tmp[dIdx] = {
          id: `day-${dIdx + 1}`,
          label: `Day ${dIdx + 1}`,
          activities: [],
        };
      tmp[dIdx].activities.push(act);
    });
    return tmp;
  }, [query.data]);

  return { days, ...query };
}
