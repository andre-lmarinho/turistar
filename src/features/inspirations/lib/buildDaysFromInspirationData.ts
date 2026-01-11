import { addDays } from "date-fns";

import { getDefaultActivityColor } from "@/features/app/planner/domain/constants/colors";
import { formatDayPlan } from "@/features/app/planner/domain/days/formatDayPlan";
import type { Activity, DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";

import type { InspirationData } from "@/features/inspirations/lib/schemas";

export function buildDaysFromInspirationData(data: InspirationData): DayPlan[] {
  const start = new Date();
  const prefix = data.destination?.slice(0, 2).toLowerCase() || "x";

  return data.itinerary.map((d, i) => {
    const { id, label } = formatDayPlan(addDays(start, i));
    const activities: Activity[] = d.activities.map((a, idx) => ({
      id: `${prefix}${i}-${idx}`,
      title: a.title,
      startTime: a.startTime,
      duration: a.duration,
      address: a.address,
      imageUrl: a.imageUrl ?? "",
      latitude: a.latitude,
      longitude: a.longitude,
      color: a.color ?? getDefaultActivityColor(),
      budget: a.budget,
    }));
    return { id, label, activities };
  });
}
