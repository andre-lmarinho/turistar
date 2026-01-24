import type { Metadata } from "next";

import { generatePlannerMetadata } from "@/features/plan/lib/generatePlannerMetadata";
import { getPlannerExperience } from "@/features/plan/lib/getPlannerExperience";
import { PlanIdView } from "@/modules/planner/planid-view";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dest?: string; token?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { planId } = await params;
  return generatePlannerMetadata(planId);
}

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { planId } = await params;
  const { dest, token } = await searchParams;

  const experience = await getPlannerExperience({
    identifier: planId,
    dest,
    editToken: token,
  });

  return <PlanIdView experience={experience} />;
}
