import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
import { WorldMapPanelClient } from '@/features/app/user/worldmap/WorldMapPanelClient';
import { worldMapMarkers } from '@/features/app/user/worldmap/mockWorldMapData';

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

    const highlightPlanId = worldMapMarkers[0]?.planId;

    return <WorldMapPanelClient markers={worldMapMarkers} highlightPlanId={highlightPlanId} />;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }
}
