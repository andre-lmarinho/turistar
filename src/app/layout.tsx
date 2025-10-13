import type { ReactNode } from 'react';

import '@/shared/utils/theme.css';
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="focus-visible:ring-ring focus-visible:bg-primary focus-visible:text-primary-foreground sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-1/2 focus-visible:-translate-x-1/2 focus-visible:rounded focus-visible:px-4 focus-visible:py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
