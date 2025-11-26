import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { InspirationGallery } from '@/features/app/user/components/dashboard/InspirationGallery';
import { PlannerGallery } from '@/features/app/user/components/dashboard/PlannerGallery';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { getUserPlanners } from '@/server/queries/plans/getUserPlanners';
import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';

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

    const inspirationItems = [
      { slug: 'paris', title: 'Paris escape', image: '/previews/preview_01.png' },
      { slug: 'rome', title: 'Rome highlights', image: '/previews/preview_02.png' },
      {
        slug: 'boipeba',
        title: 'Boipeba weekend',
        image: '/previews/preview_03.png',
        tag: 'Template',
      },
      { slug: 'lisbon', title: 'Lisbon vibes', image: '/previews/preview_04.png' },
    ];

    return (
      <div className="flex flex-col gap-8">
        <InspirationGallery items={inspirationItems} />
        <PlannerGallery plans={plans} />
      </div>
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }
}
