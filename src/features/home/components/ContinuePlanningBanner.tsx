// src/features/home/components/ContinuePlanningBanner.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { differenceInCalendarDays } from 'date-fns';

import { Button } from '@/shared/ui/button';
import { useRecentPlan } from '@/features/planner/hooks/internal/useRecentPlan';

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
      <Button variant="accent" size="sm">
        <Link href={`/planner/${slug}?${query}`}>Continue Planning</Link>
      </Button>
    </section>
  );
}
