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
    <main id="main-content" className="bg-card min-h-[calc(100dvh-4rem)] w-full">
      <h1 className="sr-only">{t("dashboardHeading")}</h1>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 md:px-8">
        {highlightedPlan ? <UpcomingTripSection plan={highlightedPlan} today={today} /> : null}

        <section aria-labelledby="map-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary-text h-5 w-5" aria-hidden="true" />
            <h2 id="map-heading" className="text-foreground text-base font-semibold">
              {t("yourTravelMap")}
            </h2>
          </div>
          <DestinationsMap countries={countries} />
        </section>

        <PlannersSection plans={plans} />
        <DemoGuideDialog isDemo={isDemo} />
      </div>
    </main>
  );
}
