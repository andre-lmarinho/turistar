// src/features/home/components/ContinuePlanningBanner.tsx
'use client';

import Link from 'next/link';
import { differenceInCalendarDays } from 'date-fns';

import { Button } from '@/shared/ui';
import { useRecentPlan } from '@/shared/lib';

export default function ContinuePlanningBanner() {
  const { recentPlan } = useRecentPlan();
  if (!recentPlan) return null;

  const { slug, dest, start, end } = recentPlan;
  const tripLength = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
  const query = new URLSearchParams({ dest, start, end }).toString();

  return (
    <section className="bg-card p-4 text-center">
      <p className="pb-2">
        Continue your {tripLength} {tripLength === 1 ? 'day' : 'days'} trip to {dest}
      </p>
      <Button
        asChild
        className="bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)]/90"
      >
        <Link href={`/planner/${slug}?${query}`}>Continue Planning</Link>
      </Button>
    </section>
  );
}
