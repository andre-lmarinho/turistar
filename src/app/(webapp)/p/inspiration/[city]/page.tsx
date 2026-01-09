import { PlannerClient } from "@/features/app/planner/components/PlannerClient";

import { getInspirationExperienceProps } from "@/features/inspirations/lib/getInspirationExperienceProps";
import { inspirationPageMetadata } from "@/features/inspirations/lib/pageMetadata";

type PageProps = {
  params: Promise<{ city: string }>;
};

export const generateMetadata = inspirationPageMetadata;

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
