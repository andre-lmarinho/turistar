// src/components/planner/PlannerControls.tsx
'use client';

import React from 'react';
import { ModeToggleButton, DateRangePicker } from '@/components';
import { usePlannerContext } from '@/contexts/PlannerContext';

type Mode = 'planner' | 'map' | 'budget';

interface PlannerControlsProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
}

export default function PlannerControls({ mode, onModeChange }: PlannerControlsProps) {
  const { currentRange, handleRangeChange } = usePlannerContext();
  return (
    <div className="order-3 container flex items-center justify-center gap-4 py-2 md:order-2 md:justify-between md:pt-0 md:pb-4">
      <ModeToggleButton value={mode} onChange={onModeChange} />
      <DateRangePicker
        value={currentRange}
        onChange={handleRangeChange}
        className="hidden md:flex"
      />
    </div>
  );
}
