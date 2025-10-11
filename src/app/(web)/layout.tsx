import type { ReactNode } from 'react';

import Providers from '@/shared/components/Providers';

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
    </Providers>
  );
}
