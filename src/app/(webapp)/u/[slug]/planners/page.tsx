import type { Metadata } from "next";

import { requireUserSlugMatch } from "@/features/user/lib/requireUserSlugMatch";
import { getUserPlanners } from "@/features/userPlanners/lib/getUserPlanners";
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
  await requireUserSlugMatch(slug);
  const plans = await getUserPlanners();

  return (
    <>
      <InspirationsView />
      <PlannersView plans={plans} />
    </>
  );
}
