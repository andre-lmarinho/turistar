import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import SeoJsonLd from '@/features/website/seo/SeoJsonLd';
import { SITE_URL } from '@/shared/utils/siteUrl';
import { Navbar, Footer } from '@/features/website/layout';

export const dynamic = 'force-dynamic';

const previewImage = new URL('/previews/preview_01.png', SITE_URL).toString();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Turistar App',
    template: '%s · Turistar',
  },
  description:
    'Plan trips with drag-and-drop cards, maps, and budget tracking. Create, organize, and share itineraries effortlessly.',
  applicationName: 'Turistar',
  keywords: [
    'travel planner',
    'trip planner',
    'itinerary',
    'budget travel',
    'map',
    'vacation planner',
  ],
  category: 'travel',
  authors: [{ name: 'Turistar Team' }],
  creator: 'Turistar',
  publisher: 'Turistar',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Turistar',
    title: 'Turistar · Plan smarter trips',
    description:
      'Plan trips with drag-and-drop cards, maps, and budget tracking. Create, organize, and share itineraries effortlessly.',
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: 'Turistar travel planner preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Turistar · Plan smarter trips',
    description:
      'Plan trips with drag-and-drop cards, maps, and budget tracking. Create, organize, and share itineraries effortlessly.',
    images: [previewImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SeoJsonLd />
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    </>
  );
}
