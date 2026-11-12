import { isValid, parseISO, startOfToday } from "date-fns";

import type { UserDestination, UserPlannerSummary } from "@/features/plan/repositories/PlanRepository";

export type TravelCountry = {
  code: string;
  tripCount: number;
  locationCount: number;
  trips: { id: string; title: string }[];
};

export function isPlanInProgress(start: Date, end: Date, today: Date): boolean {
  return isValid(start) && isValid(end) && start <= today && end >= today;
}

export function getHighlightedPlan(
  plans: UserPlannerSummary[],
  today = startOfToday()
): UserPlannerSummary | null {
  let highlighted: UserPlannerSummary | null = null;
  let earliestStart = Infinity;

  for (const plan of plans) {
    const start = parseISO(plan.startDate ?? "");
    if (!isValid(start)) continue;
    const end = parseISO(plan.endDate ?? "");
    if (start < today && !isPlanInProgress(start, end, today)) continue;
    if (start.getTime() >= earliestStart) continue;
    highlighted = plan;
    earliestStart = start.getTime();
  }

  return highlighted;
}

export function buildCountrySummaries(destinations: UserDestination[]): TravelCountry[] {
  const summaries = new Map<
    string,
    {
      tripIds: Set<string>;
      locationCount: number;
      trips: Map<string, { id: string; title: string }>;
    }
  >();

  for (const destination of destinations) {
    const code = destination.country?.trim();
    if (!code) continue;
    const key = code.toLocaleLowerCase();
    const summary = summaries.get(key) ?? {
      tripIds: new Set<string>(),
      locationCount: 0,
      trips: new Map<string, { id: string; title: string }>(),
    };
    summary.tripIds.add(destination.planId);
    summary.locationCount += destination.activityCount;
    summary.trips.set(destination.planId, { id: destination.planId, title: destination.planTitle });
    summaries.set(key, summary);
  }

  return Array.from(summaries, ([code, summary]) => ({
    code,
    tripCount: summary.tripIds.size,
    locationCount: summary.locationCount,
    trips: Array.from(summary.trips.values()),
  }));
}
