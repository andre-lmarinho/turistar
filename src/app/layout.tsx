import type { ReactNode } from 'react';

import '@/shared/utils/theme.css';
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground flex min-h-screen flex-col antialiased"
      >
        {children}
      </body>
    </html>
  );
}
