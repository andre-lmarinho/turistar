// src/features/home/components/ContinuePlanningBanner.tsx
'use client';

import Link from 'next/link';
import React from 'react';
import { differenceInCalendarDays } from 'date-fns';

import { useRecentPlan } from '@/features/planner/contracts/marketing/useRecentPlan';

export default function ContinuePlanningBanner() {
  const { recentPlan } = useRecentPlan();
  if (!recentPlan) return null;

  const { slug, dest, start, end } = recentPlan;
  const tripLength = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
  const query = new URLSearchParams({ dest, start, end }).toString();

  return (
    <section className="bg-card flex justify-center gap-10 p-4 text-center">
      <p className="my-auto">
        Continue your {tripLength} {tripLength === 1 ? 'day' : 'days'} trip to {dest}
      </p>
      <Link
        href={`/planner/${slug}?${query}`}
        className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
      >
        Continue Planning
      </Link>
    </section>
  );
}
