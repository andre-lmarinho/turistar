'use client';

import type { ReactNode } from 'react';

import { useRecentPlan } from '@/features/app/planner/hooks/data/useRecentPlan';
import { Button } from '@/shared/ui/button';

export function DesktopActions() {
  const { recentPlan } = useRecentPlan();
  let continuePlanningButton: ReactNode = null;

  if (recentPlan) {
    const { slug, dest, start, end } = recentPlan;
    const query = new URLSearchParams({ dest, start, end }).toString();

    continuePlanningButton = (
      <Button href={`/p/${slug}?${query}`} variant="accent">
        Continue Planning
      </Button>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-6 lg:ml-0 lg:justify-self-end">
      {continuePlanningButton ?? (
        <>
          <Button href="/inspiration/rome" variant="ghost">
            Try a demo
          </Button>
          <Button href="/signup">Get started</Button>
        </>
      )}
    </div>
  );
}
