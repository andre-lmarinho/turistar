import { PlannerClient } from '@/features/app/planner/components/PlannerClient';
import { getInspirationExperienceProps } from '@/features/app/planner/modules/inspiration/server/getInspirationExperienceProps';
import { inspirationPageMetadata } from '@/features/app/planner/modules/inspiration/server/pageMetadata';

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
      hideOnboarding
      persist={false}
    />
  );
}
