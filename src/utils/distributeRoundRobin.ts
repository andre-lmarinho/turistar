import { DayPlan, Activity } from '@/types/itinerary';
import { MAX_ACTIVITIES_PER_DAY } from '@/constants/planner';

export function distributeRoundRobin(baseDays: DayPlan[], activities: Activity[]): DayPlan[] {
  const copy = baseDays.map((d) => ({ ...d, activities: [] as Activity[] }));

  activities.forEach((act, idx) => {
    for (let shift = 0; shift < copy.length; shift++) {
      const day = copy[(idx + shift) % copy.length];

      if (
        day.activities.length < MAX_ACTIVITIES_PER_DAY &&
        !day.activities.some((a) => a.id === act.id)
      ) {
        day.activities.push(act);
        return;
      }
    }
  });

  return copy;
}
