import { differenceInCalendarDays, isValid, parseISO, startOfToday } from "date-fns";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { DEFAULT_PLAN_COVER_IMAGE } from "@/features/plan/config";
import type { UserPlannerSummary } from "@/features/plan/repositories/PlanRepository";

import styles from "./UpcomingTripSection.module.css";

interface UpcomingTripSectionProps {
  plan: UserPlannerSummary;
  today?: Date;
}

function isPlanInProgress(start: Date, end: Date, today: Date): boolean {
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

export async function UpcomingTripSection({ plan, today = startOfToday() }: UpcomingTripSectionProps) {
  const [t, format] = await Promise.all([getTranslations(), getFormatter()]);
  const backgroundImage = plan.coverImage ?? DEFAULT_PLAN_COVER_IMAGE;
  const destination = plan.destination ?? plan.title;
  const start = parseISO(plan.startDate ?? "");
  const end = parseISO(plan.endDate ?? "");
  const inProgress = isPlanInProgress(start, end, today);
  const dateLabel = (date: Date) =>
    isValid(date) ? format.dateTime(date, { month: "short", day: "numeric" }) : t("tbd");
  const duration =
    isValid(start) && isValid(end) && end >= start
      ? t("dayCount", { count: differenceInCalendarDays(end, start) + 1 })
      : t("tbd");
  const daysAway = isValid(start)
    ? t("dayCount", { count: Math.max(0, differenceInCalendarDays(start, today)) })
    : t("tbd");
  const tripStats = [
    { label: t(inProgress ? "started" : "starts"), value: dateLabel(start) },
    { label: t("duration"), value: duration },
    { label: t(inProgress ? "ends" : "daysAway"), value: inProgress ? dateLabel(end) : daysAway },
  ];
  const image = `url("${backgroundImage.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;

  return (
    <section aria-labelledby="upcoming-trip-heading">
      <Link
        href={`/p/${plan.id}`}
        className="group relative block min-h-88 overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: image }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-black/10"
        />

        <div className="relative flex min-h-88 flex-col justify-between p-5 sm:p-6">
          <p className="w-fit rounded-full bg-black/35 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
            {t(inProgress ? "currentTrip" : "nextTrip")}
          </p>

          <div
            className={`${styles.ticket} overflow-hidden rounded-2xl bg-background text-foreground shadow-lg`}>
            <div className="flex items-center px-5 py-4 sm:px-6">
              <h2
                id="upcoming-trip-heading"
                className="min-w-0 wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
                {destination}
              </h2>
            </div>
            <div className="flex items-center px-3 py-3 sm:px-4">
              <dl className="grid w-full grid-cols-3 divide-x divide-border">
                {tripStats.map((stat) => (
                  <div key={stat.label} className="min-w-0 px-2 text-center sm:px-4">
                    <dt className="text-muted-foreground text-[0.65rem] font-medium tracking-[0.12em] uppercase">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 truncate text-sm font-semibold tabular-nums sm:text-base">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
