import { startOfToday } from "date-fns";
import { getTranslations } from "next-intl/server";

import { DemoGuideDialog } from "@/features/demo/components/DemoGuideDialog";
import type { UserDestination, UserPlannerSummary } from "@/features/plan/repositories/PlanRepository";
import { DestinationsMap } from "@/modules/user/components/DestinationsMap";
import { PlannersSection } from "@/modules/user/components/PlannersSection";
import { UpcomingTripSection } from "@/modules/user/components/UpcomingTripSection";
import { buildCountrySummaries, getHighlightedPlan } from "@/modules/user/lib/dashboardModel";
import { MapPin } from "@/ui/components/icon";

interface DashboardViewProps {
  plans: UserPlannerSummary[];
  destinations: UserDestination[];
  isDemo?: boolean;
}

export async function DashboardView({ plans, destinations, isDemo = false }: DashboardViewProps) {
  const t = await getTranslations();
  const countries = buildCountrySummaries(destinations);
  const today = startOfToday();
  const highlightedPlan = getHighlightedPlan(plans, today);

  return (
    <main
      id="main-content"
      className="min-h-[calc(100dvh-4rem)] w-full bg-folio-paper/50 text-folio-ink selection:bg-folio-citron selection:text-folio-ink">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 md:space-y-12 md:px-8 md:py-10">
        <header>
          <p className="text-xs font-semibold tracking-[0.12em] text-folio-ink-soft uppercase">
            {t("dashboardWelcome")}
          </p>
          <h1 className="mt-1 font-folio-display text-4xl leading-tight tracking-[-0.035em] text-folio-ink sm:text-5xl">
            {t("dashboardHeading")}
          </h1>
        </header>

        {highlightedPlan ? (
          <UpcomingTripSection plan={highlightedPlan} today={today} />
        ) : (
          <section className="border border-folio-line bg-folio-white px-6 py-8 sm:px-8">
            <h2 className="font-folio-display text-3xl text-folio-ink">{t("yourTrips")}</h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-folio-ink-soft">
              {t("noUpcomingTrip")}
            </p>
          </section>
        )}

        <div className="grid items-start gap-10 xl:grid-cols-[1fr_0.92fr] xl:gap-12">
          <PlannersSection plans={plans} />

          <section aria-labelledby="map-heading" className="min-w-0 space-y-4">
            <div className="flex items-center gap-3 border-b border-folio-line pb-3">
              <MapPin className="size-5 text-folio-coral" aria-hidden="true" />
              <h2 id="map-heading" className="font-folio-display text-2xl text-folio-ink">
                {t("yourTravelMap")}
              </h2>
            </div>
            <DestinationsMap countries={countries} />
          </section>
        </div>
        <DemoGuideDialog isDemo={isDemo} />
      </div>
    </main>
  );
}
