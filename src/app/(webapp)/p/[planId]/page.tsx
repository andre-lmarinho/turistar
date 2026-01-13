import type { Metadata } from "next";

import { generatePlannerMetadata } from "@/features/app/planner/server/queries/plans/generatePlannerMetadata";
import { getPlannerExperience } from "@/features/app/planner/server/queries/plans/getPlannerExperience";
import { PlanIdView } from "@/modules/planner/planid-view";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dest?: string; token?: string }>;
};

/**
 * Generate page metadata for the planner identified by `planId`.
 *
 * @param params - Route params object containing the `planId` route parameter.
 * @returns The metadata for the planner page corresponding to `planId`.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { planId } = await params;
  return generatePlannerMetadata(planId);
}

/**
 * Fetches the planner experience for the given planId and renders the PlanIdView.
 *
 * @param params - A promise resolving to an object containing the `planId` string route parameter.
 * @param searchParams - A promise resolving to an object with optional `dest` and `token` query parameters used when loading the experience.
 * @returns A React element that renders `PlanIdView` populated with the fetched planner experience.
 */
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