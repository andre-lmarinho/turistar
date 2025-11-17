import { PlannerClient } from '@/features/planner/components/PlannerClient';
import { getPublicPlannerExperience } from '@/features/planner/server/getPublicPlannerExperience';
import { getCurrentUser } from '@/shared/lib/auth/session';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dest?: string; token?: string }>;
};

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { dest, token } = await searchParams;
  const user = await getCurrentUser();

  const experience = await getPublicPlannerExperience({
    slug,
    dest,
    viewerUserId: user?.id,
    editToken: token,
  });

  return (
    <PlannerClient
      initialDays={experience.initialDays}
      planId={experience.planId}
      slug={slug}
      dest={experience.destination}
      title={experience.title ?? experience.destination}
      initialBudget={experience.initialBudget}
      initialEntries={experience.initialEntries}
      canEdit={experience.canEdit}
      editToken={experience.editToken}
    />
  );
}
