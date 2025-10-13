import type { Metadata } from 'next';
import { capitalize } from '@/shared/utils/capitalize';
import { SITE_URL } from '@/shared/constants/site';

import { assertValidCitySlug, safeReadInspirationData } from './inspirationData';

export async function generateInspirationMetadata(city: string): Promise<Metadata> {
  assertValidCitySlug(city);

  const title = `${capitalize(city)} Inspiration`;
  const pageUrl = `${SITE_URL}/inspiration/${city}`;
  const defaultDescription = `Plan a trip to ${capitalize(city)} with suggested activities, map, and budget tracking.`;
  const metadata: Metadata = {
    title,
    description: defaultDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      url: pageUrl,
      siteName: 'Turistar',
      title,
      description: defaultDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: defaultDescription,
    },
    keywords: [capitalize(city), 'travel planner', 'itinerary', 'budget travel', 'map'],
  };

  const data = await safeReadInspirationData(city);
  const description = data.description?.trim();
  if (description) {
    metadata.description = description;
    if (metadata.openGraph) {
      metadata.openGraph.description = description;
      metadata.openGraph.title = data.title ?? metadata.openGraph.title;
    }
    if (metadata.twitter) {
      metadata.twitter.description = description;
      metadata.twitter.title = data.title ?? metadata.twitter.title;
    }
    metadata.title = data.title ?? metadata.title;
  }

  const activities = data.itinerary?.flatMap((day) => day.activities ?? []);
  const firstWithImage = activities?.find((activity) => activity.imageUrl)?.imageUrl;
  const ogImage = firstWithImage
    ? firstWithImage.startsWith('http')
      ? firstWithImage
      : new URL(firstWithImage, SITE_URL).toString()
    : new URL('/previews/preview_01.png', SITE_URL).toString();

  if (metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${title} preview`,
      },
    ];
  }

  if (metadata.twitter) {
    metadata.twitter.images = [ogImage];
  }

  return metadata;
}
