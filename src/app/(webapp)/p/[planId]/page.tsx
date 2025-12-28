import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PlannerClient } from '@/features/app/planner/components/PlannerClient';
import { getPublicPlannerExperience } from '@/features/app/planner/server/queries/plans/getPublicPlannerExperience';
import { getUserPlannerExperience } from '@/features/app/planner/server/queries/plans/getUserPlannerExperience';
import { getCurrentUser, requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const supabase = createSupabaseServerClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    planId
  );

  try {
    const { data } = await supabase
      .from('plans')
      .select('title, plan_destinations(destinations(name))')
      .eq(isUuid ? 'id' : 'public_slug', planId)
      .maybeSingle();

    const titleFromPlan = data?.title?.trim();
    const titleFromDest = data?.plan_destinations?.[0]?.destinations?.name?.trim();
    const resolvedTitle = titleFromPlan || titleFromDest || 'Planner';

    return { title: `${resolvedTitle} | Turistar App` };
  } catch {
    return { title: 'Planner | Turistar App' };
  }
}

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
          viewerUserId={user.id}
          isOwner={experience.isOwner}
          isAdmin={experience.isAdmin}
          canManageMembers={experience.canManageMembers}
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
      viewerUserId={user?.id ?? null}
      isOwner={experience.isOwner}
      isAdmin={experience.isAdmin}
      canManageMembers={experience.canManageMembers}
      editToken={experience.editToken}
    />
  );
}
