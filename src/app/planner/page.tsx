// src/app/planner/page.tsx
'use client';

import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { SITE_URL } from '@/shared/constants/site';

export const dynamic = 'force-dynamic';

const pageUrl = new URL('/planner', SITE_URL).toString();
const previewImage = new URL('/previews/preview_01.png', SITE_URL).toString();

export const metadata: Metadata = {
  title: { absolute: 'Planner – Turistar' },
  description:
    'Create trip itineraries with drag-and-drop cards, maps, and budget tracking using the Turistar planner.',
  alternates: { canonical: '/planner' },
  openGraph: {
    type: 'website',
    url: pageUrl,
    siteName: 'Turistar',
    title: 'Planner – Turistar',
    description:
      'Create trip itineraries with drag-and-drop cards, maps, and budget tracking using the Turistar planner.',
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: 'Turistar planner preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planner – Turistar',
    description:
      'Create trip itineraries with drag-and-drop cards, maps, and budget tracking using the Turistar planner.',
    images: [previewImage],
  },
  keywords: [
    'travel planner',
    'trip planner',
    'itinerary',
    'budget travel',
    'map',
    'vacation planner',
  ],
};

const PlannerClient = nextDynamic(() => import('./PlannerClient'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading planner…" />,
});

export default function PlannerPage() {
  return <PlannerClient />;
}
