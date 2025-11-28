import type { ReactNode } from 'react';

import { ClientProviders } from '@/app/providers';
import { AppBar } from '@/features/app/layout/AppBar';

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <AppBar />
      {children}
    </ClientProviders>
  );
}
