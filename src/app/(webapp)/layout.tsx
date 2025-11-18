import type { ReactNode } from 'react';

import { ClientProviders } from '@/app/providers';

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
