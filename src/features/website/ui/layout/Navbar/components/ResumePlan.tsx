'use client';

import React from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { useRecentPlan } from '@/features/planner/hooks/data/useRecentPlan';

export function ResumePlan() {
  const { recentPlan } = useRecentPlan();
  if (!recentPlan) return null;

  const { slug, dest, start, end } = recentPlan;
  const tripLength = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
  const query = new URLSearchParams({ dest, start, end }).toString();

  return (
    <div className="bg-card fixed right-2 bottom-3 left-2 flex justify-center gap-10 rounded-2xl border p-4 text-center">
      <p className="my-auto">
        Continue your {tripLength} {tripLength === 1 ? 'day' : 'days'} trip to {dest}
      </p>
      <Button href={`/planner/${slug}?${query}`} variant="accent">
        Continue Planning
      </Button>
    </div>
  );
}
