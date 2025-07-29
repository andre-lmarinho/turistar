// src/app/layout.tsx

import type { Metadata } from 'next';
import { Geist, Geist_Mono, Architects_Daughter } from 'next/font/google';
import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';

import { Providers } from '@/components';

/* fonts */
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const architectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-architects-daughter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Travel Planner',
  description: 'Plan trips with drag-and-drop cards and budget tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${architectsDaughter.variable}`}
    >
      <body
        suppressHydrationWarning
        className={`antialiased ${geistSans.className} bg-background text-foreground`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
