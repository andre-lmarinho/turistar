import type { Metadata } from 'next';

import { getUserPlanners } from '@/features/app/planner/server/queries/plans/getUserPlanners';
import { requireUserSlugMatch } from '@/features/app/user/server/guards/requireUserSlugMatch';

import { InspirationGallery } from '@/features/app/user/components/dashboard/InspirationGallery';
import { PlannerGallery } from '@/features/app/user/components/dashboard/PlannerGallery';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Planners | Turistar App',
  };
}

interface DashboardPlannersPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardPlannersPage({ params }: DashboardPlannersPageProps) {
  const { slug } = await params;
  const { user } = await requireUserSlugMatch(slug);
  const plans = await getUserPlanners(user.id);

  return (
    <>
      <InspirationGallery />
      <PlannerGallery plans={plans} />
    </>
  );
}
