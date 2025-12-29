import type { Metadata } from 'next';

import { requireUserSlugMatch } from '@/features/app/user/server/guards/requireUserSlugMatch';

import { InspirationGallery } from '@/features/app/user/components/dashboard/InspirationGallery';

export const metadata: Metadata = {
  title: 'Inspirations | Turistar App',
};

interface UserInspirationsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function UserInspirationsPage({ params }: UserInspirationsPageProps) {
  const { slug } = await params;
  await requireUserSlugMatch(slug);

  return <InspirationGallery />;
}
