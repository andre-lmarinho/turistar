import type { ReactNode } from 'react';

import MarketingNavbar from '@/features/marketing/components/Navbar';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <MarketingNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
