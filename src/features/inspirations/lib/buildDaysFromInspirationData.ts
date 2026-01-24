import { addDays } from "date-fns";

import { getDefaultColor } from "@/features/activity/constants";
import { formatDay } from "@/features/activity/lib/dayOperations";
import type { Activity, DayPlan } from "@/features/activity/types";

import type { InspirationData } from "../lib/schemas";

export function buildDaysFromInspirationData(data: InspirationData): DayPlan[] {
  const start = new Date();
  const prefix = data.destination?.slice(0, 2).toLowerCase() || "x";

  return data.itinerary.map((d, i) => {
    const { id, label } = formatDay(addDays(start, i));
    const activities: Activity[] = d.activities.map((a, idx) => ({
      id: `${prefix}${i}-${idx}`,
      title: a.title,
      startTime: a.startTime,
      duration: a.duration,
      address: a.address,
      imageUrl: a.imageUrl ?? "",
      latitude: a.latitude,
      longitude: a.longitude,
      color: a.color ?? getDefaultColor(),
      budget: a.budget,
    }));
    return { id, label, activities };
  });
}
