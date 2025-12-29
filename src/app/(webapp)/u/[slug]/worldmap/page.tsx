import type { Metadata } from 'next';

import { getVisitedCountries } from '@/features/app/planner/server/queries/plans/getVisitedCountries';
import { requireUserSlugMatch } from '@/features/app/user/server/guards/requireUserSlugMatch';

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
  const { user } = await requireUserSlugMatch(slug);
  let visitedCountries: VisitedCountry[] = [];

  try {
    visitedCountries = await getVisitedCountries(user.id);
  } catch (getVisitedError) {
    console.error('Failed to load visited countries', getVisitedError);
  }

  return <WorldMapBoard visitedCountries={visitedCountries} />;
}
