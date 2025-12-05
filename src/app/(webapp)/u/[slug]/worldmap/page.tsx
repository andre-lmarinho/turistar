import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getUserProfileBySlug } from '@/server/queries/profile/getUserProfileBySlug';
import { requireUser, UnauthorizedError } from '@/shared/lib/auth/session';
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

    return <WorldMapBoard />;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect('/login');
    }

    throw error;
  }
}
