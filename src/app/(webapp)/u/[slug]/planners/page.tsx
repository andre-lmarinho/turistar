import type { Metadata } from "next";

import { getUserPlanners } from "@/features/plan/lib/getUserPlanners";
import { requireProfileSlugMatch } from "@/features/profile/lib/requireProfileSlugMatch";
import { InspirationsView } from "@/modules/user/inspirations-view";
import { PlannersView } from "@/modules/user/planners-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Planners | Turistar App",
  };
}

interface DashboardPlannersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardPlannersPage({ params }: DashboardPlannersPageProps) {
  const { slug } = await params;
  await requireProfileSlugMatch(slug);
  const plans = await getUserPlanners();

  return (
    <>
      <InspirationsView excludePlanIds={plans.map((plan) => plan.id)} />
      <PlannersView plans={plans} />
    </>
  );
}
