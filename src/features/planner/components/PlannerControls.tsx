// src/features/planner/components/PlannerControls.tsx
'use client';

import React from 'react';
import { DateRangePicker } from '@/shared/ui/DatePicker';
import ModeToggleButton from '@/shared/ui/button-especials/ModeToggleButton';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';

type Mode = 'planner' | 'map' | 'budget';

interface PlannerControlsProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
}

export default function PlannerControls({ mode, onModeChange }: PlannerControlsProps) {
  const { currentRange, handleRangeChange } = usePlannerContext();
  return (
    <div className="order-3 mx-auto flex w-full max-w-screen-xl items-center justify-center gap-4 py-2 md:order-2 md:justify-between md:pt-0 md:pb-4">
      <ModeToggleButton value={mode} onChange={onModeChange} />
      <DateRangePicker
        value={currentRange}
        onChange={handleRangeChange}
        className="hidden md:flex"
      />
    </div>
  );
}
