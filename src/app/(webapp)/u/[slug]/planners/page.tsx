import type { Metadata } from "next";

import { InspirationGallery } from "@/features/app/user/components/dashboard/InspirationGallery";
import { PlannerGallery } from "@/features/app/user/components/dashboard/PlannerGallery";
import { requireUserSlugMatch } from "@/features/user/guards/requireUserSlugMatch";
import { getUserPlanners } from "@/features/user/queries/getUserPlanners";

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
  const { user } = await requireUserSlugMatch(slug);
  const plans = await getUserPlanners(user.id);

  return (
    <>
      <InspirationGallery />
      <PlannerGallery plans={plans} />
    </>
  );
}
