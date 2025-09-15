// src/app/layout.tsx

import type { Metadata } from 'next';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Providers from '@/shared/components/Providers';
import SupabaseProvider from '@/shared/components/providers/SupabaseProvider';
import { SeoJsonLd } from '@/shared/components/SeoJsonLd';
import { SITE_URL } from '@/shared/constants/site';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <SeoJsonLd />
        <SupabaseProvider>
          <Providers>{children}</Providers>
        </SupabaseProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
