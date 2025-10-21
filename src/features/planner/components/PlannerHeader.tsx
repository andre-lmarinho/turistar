'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';

import { DateRangePickerIcon } from '@/shared/ui/calendar';
import { useElementMeasure } from '@/features/planner/hooks/ui/useElementMeasure';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { ModeToggleButton } from '@/features/planner/components/ui/ModeToggleButton';
import type { PlannerMode } from './PlannerModeDeck';

interface PlannerHeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  currentRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  mode: PlannerMode;
  onModeChange: (mode: PlannerMode) => void;
}

export function PlannerHeader({
  title,
  onTitleChange,
  onTitleBlur,
  currentRange,
  onRangeChange,
  mode,
  onModeChange,
}: PlannerHeaderProps) {
  const { dest } = usePlannerContext();
  const { ref: titleRef, width: titleWidth } = useElementMeasure<HTMLInputElement>({
    width: true,
    text: title,
  });

  const headingText = title?.trim().length ? title : (dest ?? 'Your trip plan');

  return (
    <header className="mx-auto flex w-full max-w-screen-xl flex-row justify-between gap-4 pb-4 md:items-center">
      <h1 className="bg-card inline-flex flex-none cursor-pointer rounded-md text-3xl font-semibold whitespace-nowrap capitalize hover:bg-[color-mix(in_oklch,var(--card)_75%,var(--card-foreground)_5%)]">
        <span id="planner-title-heading" className="sr-only">
          {headingText}
        </span>
        <input
          id="planner-title"
          name="title"
          aria-labelledby="planner-title-heading"
          aria-label="Planner title"
          type="text"
          ref={titleRef}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          onBlur={onTitleBlur}
          style={{ width: `${titleWidth}px` }}
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => event.target.select()}
          className="focus:border-border focus:bg-background cursor-pointer rounded-md border-2 border-transparent bg-transparent px-2 py-1 transition-colors outline-none focus:cursor-text"
        />
      </h1>
      <div className="flex flex-none items-center gap-2 self-end md:self-end">
        <DateRangePickerIcon value={currentRange} onChange={onRangeChange} />
        <div className="hidden md:inline">
          <ModeToggleButton value={mode} onChange={onModeChange} />
        </div>
      </div>
    </header>
  );
}
