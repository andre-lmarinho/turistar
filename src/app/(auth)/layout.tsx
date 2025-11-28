import type { ReactNode } from 'react';

import { ClientProviders } from '@/app/providers';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <main className="min-h-screen">{children}</main>
    </ClientProviders>
  );
}
