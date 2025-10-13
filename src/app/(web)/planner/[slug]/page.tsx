import { PlannerClient } from '@/features/planner/components/PlannerClient';
import { getPublicPlannerExperience } from '@/features/planner/server/getPublicPlannerExperience';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dest?: string }>;
};

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { dest } = await searchParams;

  const experience = await getPublicPlannerExperience({ slug, dest });

  return (
    <PlannerClient
      initialDays={experience.initialDays}
      planId={experience.planId}
      slug={slug}
      dest={experience.destination}
      title={experience.title ?? experience.destination}
    />
  );
}
