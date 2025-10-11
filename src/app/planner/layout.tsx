import type { ReactNode } from 'react';

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="bg-background text-foreground min-h-screen">
      {children}
    </main>
  );
}
