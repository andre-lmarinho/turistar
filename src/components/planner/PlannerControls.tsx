// src/components/planner/PlannerControls.tsx
'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';
import { ModeToggleButton, DateRangePicker } from '@/components';

type Mode = 'planner' | 'map' | 'budget';

interface PlannerControlsProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  range: DateRange | undefined;
  onRangeChange: (r: DateRange | undefined) => void;
}

export default function PlannerControls({
  mode,
  onModeChange,
  range,
  onRangeChange,
}: PlannerControlsProps) {
  return (
    <div className="order-3 container flex items-center justify-center gap-4 py-2 md:order-2 md:justify-between md:pt-0 md:pb-4">
      <ModeToggleButton value={mode} onChange={onModeChange} />
      <DateRangePicker value={range} onChange={onRangeChange} className="hidden md:flex" />
    </div>
  );
}
