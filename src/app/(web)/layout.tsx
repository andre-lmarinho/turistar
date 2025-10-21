import type { ReactNode } from 'react';

import Providers from '@/app/(web)/providers';

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <main className="min-h-screen">{children}</main>
    </Providers>
  );
}
