import type { ReactNode } from 'react';

import '@/shared/utils/theme.css';
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
