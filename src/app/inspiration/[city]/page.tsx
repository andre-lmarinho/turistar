// src/app/inspiration/[city]/page.tsx
export const dynamic = 'force-dynamic';

import { promises as fs } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import InspirationPlanner from '../InspirationPlanner';
import {
  buildDaysFromInspirationData,
  type InspirationData,
} from '@/features/planner/services/buildDaysFromInspirationData';
import { capitalize } from '@/shared/utils';
import { SITE_URL } from '@/shared/constants/site';

type CityParams = { city: string };

/* <head> metadata */
export async function generateMetadata({
  params,
}: {
  params: Promise<CityParams>;
}): Promise<Metadata> {
  const { city } = await params;
  const title = `${capitalize(city)} Inspiration`;
  const pageUrl = `${SITE_URL}/inspiration/${city}`;

  let description = `Plan a trip to ${capitalize(
    city
  )} with suggested activities, map, and budget tracking.`;
  let ogImage: string | undefined;

  try {
    const filePath = join(process.cwd(), 'src', 'data', `${city}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw) as InspirationData & {
      title?: string;
      description?: string;
      itinerary?: { activities?: { imageUrl?: string }[] }[];
    };

    if (data?.description && data.description.trim().length > 0) {
      description = data.description;
    }

    // Try to pick a representative image from the first activity with imageUrl
    const firstWithImage = data?.itinerary
      ?.flatMap((d) => d.activities ?? [])
      ?.find((a) => a.imageUrl)?.imageUrl;
    if (firstWithImage) {
      ogImage = firstWithImage.startsWith('http')
        ? firstWithImage
        : new URL(firstWithImage, SITE_URL).toString();
    } else {
      ogImage = new URL('/previews/preview_01.png', SITE_URL).toString();
    }
  } catch {
    // Fallbacks if the city JSON cannot be read
    ogImage = new URL('/previews/preview_01.png', SITE_URL).toString();
  }

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      url: pageUrl,
      siteName: 'Turistar',
      title,
      description,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: `${title} preview` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    keywords: [capitalize(city), 'travel planner', 'itinerary', 'budget travel', 'map'],
  };
}

/* page component */
export default async function InspirationPage({ params }: { params: Promise<CityParams> }) {
  const { city } = await params;

  if (!/^[a-z0-9-]+$/.test(city)) notFound();

  try {
    const filePath = join(process.cwd(), 'src', 'data', `${city}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw) as InspirationData;

    const initialDays = buildDaysFromInspirationData(data);
    const initialBudget = data.budget?.amount ?? 0;
    const initialEntries = (data.expenses ?? []).map((e, i) => ({
      id: `exp-${i}`,
      ...e,
    }));

    return (
      <InspirationPlanner
        initialDays={initialDays}
        dest={city}
        planId={`${city}-inspiration`}
        initialBudget={initialBudget}
        initialEntries={initialEntries}
      />
    );
  } catch {
    notFound();
  }
}
