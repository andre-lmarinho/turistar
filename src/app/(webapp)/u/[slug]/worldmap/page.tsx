import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';
import { getVisitedCountries } from '@/features/app/planner/server/queries/plans/getVisitedCountries';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import type { VisitedCountry } from '@/shared/types/worldMap';
import { WorldMapBoard } from '@/features/app/user/components/worldmap/WorldMapBoard';

export const metadata: Metadata = {
  title: 'Worldmap | Turistar App',
};

interface DashboardWorldmapPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardWorldmapPage({ params }: DashboardWorldmapPageProps) {
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

    let visitedCountries: VisitedCountry[] = [];

    try {
      visitedCountries = await getVisitedCountries(user.id);
    } catch (getVisitedError) {
      console.error('Failed to load visited countries', getVisitedError);
    }

    return <WorldMapBoard visitedCountries={visitedCountries} />;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }
}
