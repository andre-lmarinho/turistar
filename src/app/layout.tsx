// src/app/layout.tsx

import type { Metadata } from 'next';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';

import { Providers } from '@/components';

export const metadata: Metadata = {
  title: 'Travel Planner',
  description: 'Plan trips with drag-and-drop cards and budget tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
