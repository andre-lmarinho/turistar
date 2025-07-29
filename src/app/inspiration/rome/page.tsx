// src/app/inspiration/rome/page.tsx
'use client';

import React, { useMemo } from 'react';
import rome from '@/data/rome.json';
import InspirationPlanner from './InspirationPlanner';
import { formatDayPlan } from '@/utils';
import type { DayPlan, Activity } from '@/types';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/constants';

export const metadata = {
  title: 'Rome Inspiration',
};

function buildInitialDays(): DayPlan[] {
  const start = new Date();
  return rome.itinerary.map((d, i) => {
    const { id, label } = formatDayPlan(new Date(start.getTime() + i * 86400000));
    const activities: Activity[] = d.activities.map((a, idx) => ({
      id: `r${i}-${idx}`,
      title: a.title,
      startTime: a.startTime,
      duration: a.duration,
      address: a.address,
      imageUrl: a.imageUrl,
      color: a.color ?? DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
    }));
    return { id, label, activities };
  });
}

export default function RomeInspirationPage() {
  const initialDays = useMemo(buildInitialDays, []);
  return <InspirationPlanner initialDays={initialDays} dest="rome" planId="rome-inspiration" />;
}
