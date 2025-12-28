import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { InspirationGallery } from '@/features/app/user/components/dashboard/InspirationGallery';
import { PlannerGallery } from '@/features/app/user/components/dashboard/PlannerGallery';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { getUserPlanners } from '@/features/app/planner/server/queries/plans/getUserPlanners';
import { getUserProfileBySlug } from '@/features/app/user/server/queries/profile/getUserProfileBySlug';

interface DashboardPlannersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Planners | Turistar App',
  };
}

export default async function DashboardPlannersPage({ params }: DashboardPlannersPageProps) {
  const { slug } = await params;
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    redirect('/login');
  }

  try {
    const user = await requireUser();
    const profile = await getUserProfileBySlug(normalizedSlug);

    if (!profile || profile.userId !== user.id) {
      redirect('/login');
    }

    const plans = await getUserPlanners(user.id);

    return (
      <>
        <InspirationGallery />
        <PlannerGallery plans={plans} />
      </>
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }
}
