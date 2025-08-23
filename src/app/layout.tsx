// src/app/layout.tsx

import type { Metadata } from 'next';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Providers from '@/shared/components/Providers';
import SupabaseProvider from '@/shared/components/providers/SupabaseProvider';

export const metadata: Metadata = {
  title: 'Turistar App',
  description: 'Plan trips with drag-and-drop cards and budget tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <SupabaseProvider>
          <Providers>{children}</Providers>
        </SupabaseProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
