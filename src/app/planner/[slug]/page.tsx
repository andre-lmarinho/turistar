// src/app/planner/[slug]/page.tsx
export { dynamic } from '@/features/planner';

import { PlannerExperience, getPlannerExperience } from '@/features/planner';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dest?: string }>;
};

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { dest } = await searchParams;

  const experience = await getPlannerExperience({ slug, dest });

  return (
    <PlannerExperience
      initialDays={experience.initialDays}
      planId={experience.planId}
      slug={slug}
      dest={experience.destination}
      title={experience.title ?? experience.destination}
    />
  );
}
