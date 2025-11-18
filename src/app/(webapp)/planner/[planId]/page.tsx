import { notFound, redirect } from 'next/navigation';

import { PlannerClient } from '@/features/planner/components/PlannerClient';
import { getPublicPlannerExperience } from '@/features/planner/server/getPublicPlannerExperience';
import { getUserPlannerExperience } from '@/server/queries/plans/getUserPlannerExperience';
import { getCurrentUser, requireUser, UnauthorizedError } from '@/shared/lib/auth/session';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dest?: string; token?: string }>;
};

function looksLikePlanId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { planId } = await params;
  const identifier = planId?.trim();

  if (!identifier) {
    notFound();
  }

  if (looksLikePlanId(identifier)) {
    try {
      const user = await requireUser();
      const experience = await getUserPlannerExperience(identifier, user.id);

      return (
        <PlannerClient
          initialDays={experience.initialDays}
          planId={experience.planId}
          dest={experience.destination}
          title={experience.title ?? experience.destination}
          canEdit
          editToken={experience.editToken}
          initialBudget={experience.initialBudget}
          initialEntries={experience.initialEntries}
        />
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        redirect('/login');
      }

      throw error;
    }
  }

  const { dest, token } = await searchParams;
  const user = await getCurrentUser();

  const experience = await getPublicPlannerExperience({
    slug: identifier,
    dest,
    viewerUserId: user?.id,
    editToken: token,
  });

  return (
    <PlannerClient
      initialDays={experience.initialDays}
      planId={experience.planId}
      slug={identifier}
      dest={experience.destination}
      title={experience.title ?? experience.destination}
      initialBudget={experience.initialBudget}
      initialEntries={experience.initialEntries}
      canEdit={experience.canEdit}
      editToken={experience.editToken}
    />
  );
}
