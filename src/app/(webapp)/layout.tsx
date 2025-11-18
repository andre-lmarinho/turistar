import type { ReactNode } from 'react';

import { ClientProviders } from '@/features/app/providers/ClientProviders';

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
