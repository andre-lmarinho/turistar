import { differenceInCalendarDays, isValid, parseISO, startOfToday } from "date-fns";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { DEFAULT_PLAN_COVER_IMAGE } from "@/features/plan/config";
import type { UserPlannerSummary } from "@/features/plan/repositories/PlanRepository";
import { isPlanInProgress } from "@/modules/user/lib/dashboardModel";
import { ArrowRight } from "@/ui/components/icon";

interface UpcomingTripSectionProps {
  plan: UserPlannerSummary;
  today?: Date;
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
        className="group grid min-h-80 overflow-hidden border border-folio-ink/10 bg-folio-ink text-folio-white focus-visible:outline-[3px] focus-visible:outline-folio-coral focus-visible:outline-offset-[3px] motion-reduce:transition-none lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-w-0 flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div>
            <p className="inline-flex w-fit items-center gap-2 bg-folio-citron px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-folio-ink uppercase">
              <span className="size-2 rounded-full bg-folio-coral" aria-hidden="true" />
              {t(inProgress ? "currentTrip" : "nextTrip")}
            </p>
            <h2
              id="upcoming-trip-heading"
              className="mt-5 max-w-[14ch] wrap-break-word font-folio-display text-4xl leading-[1.02] tracking-[-0.035em] text-folio-white sm:text-5xl">
              {destination}
            </h2>
            <p className="mt-3 text-sm text-folio-white/80">
              {dateLabel(start)} – {dateLabel(end)}
            </p>
          </div>
          <dl className="grid grid-cols-3 border-t border-folio-white/25 pt-4">
            {tripStats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 border-r border-folio-white/25 px-3 first:pl-0 last:border-0">
                <dt className="text-xs font-semibold tracking-[0.1em] text-folio-white/70 uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold tabular-nums text-folio-white sm:text-base">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <span className="inline-flex min-h-11 w-fit items-center gap-3 bg-folio-citron px-4 text-sm font-bold text-folio-ink transition-colors group-hover:bg-folio-citron-hover motion-reduce:transition-none">
            {t("openTrip")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="relative min-h-52 overflow-hidden bg-folio-ink-soft lg:min-h-full">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: image }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-folio-ink/30 via-transparent to-folio-ink/10"
          />
        </div>
      </Link>
    </section>
  );
}
