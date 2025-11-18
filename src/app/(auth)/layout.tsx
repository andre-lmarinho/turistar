import type { ReactNode } from 'react';

import { ClientProviders } from '@/features/app/providers/ClientProviders';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <main className="min-h-screen">{children}</main>
    </ClientProviders>
  );
}
