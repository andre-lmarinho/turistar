import type { Metadata } from "next";

import { PlannerClient } from "@/features/app/planner/components/PlannerClient";
import { generateInspirationMetadata } from "@/features/inspirations/lib/generateInspirationMetadata";
import { getInspirationExperienceProps } from "@/features/inspirations/lib/getInspirationExperienceProps";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  return generateInspirationMetadata(city);
}

export default async function InspirationPlannerPage({ params }: PageProps) {
  const { city } = await params;
  const experience = await getInspirationExperienceProps(city);

  return (
    <PlannerClient
      initialDays={experience.initialDays}
      planId={experience.planId}
      dest={experience.dest}
      title={experience.dest}
      initialBudget={experience.initialBudget}
      initialEntries={experience.initialEntries}
      canEdit={false}
      persist={false}
    />
  );
}
