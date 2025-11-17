import { redirect } from 'next/navigation';

import { PlannerClient } from '@/features/planner/components/PlannerClient';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';
import { getUserPlannerExperience } from '@/server/queries/plans/getUserPlannerExperience';

interface PlannerDetailPageProps {
  params: { slug: string; planId: string };
}

export const dynamic = 'force-dynamic';

export default async function PlannerDetailPage({ params }: PlannerDetailPageProps) {
  const { slug, planId } = params;

  try {
    const user = await requireUser();
    const profile = await getUserProfileBySlug(slug);

    if (!profile || profile.userId !== user.id) {
      redirect('/login');
    }

    const experience = await getUserPlannerExperience(planId, user.id);

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
