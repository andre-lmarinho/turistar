'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';

import { DateRangePicker, DateRangePickerIcon } from '@/shared/ui/calendar';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';

interface PlannerHeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  currentRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
}

export function PlannerHeader({
  title,
  onTitleChange,
  onTitleBlur,
  currentRange,
  onRangeChange,
}: PlannerHeaderProps) {
  const { dest } = usePlannerContext();
  const { ref: titleRef, width: titleWidth } = useElementMeasure<HTMLInputElement>({
    width: true,
    text: title,
  });

  const headingText = title?.trim().length ? title : (dest ?? 'Your trip plan');

  return (
    <header className="order-1 mx-auto flex w-full max-w-screen-xl flex-col gap-4 pb-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="bg-card inline-flex flex-none cursor-pointer rounded-md text-3xl font-semibold whitespace-nowrap capitalize hover:bg-[color-mix(in_oklch,var(--card)_75%,var(--card-foreground)_5%)] md:text-5xl">
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
            className="focus:border-border focus:bg-background cursor-pointer rounded-md border-2 border-transparent bg-transparent px-4 py-2 transition-colors outline-none focus:cursor-text"
          />
        </h1>
        <div className="flex gap-2 md:hidden">
          <DateRangePickerIcon value={currentRange} onChange={onRangeChange} />
        </div>
      </div>

      <div className="hidden w-full md:flex md:items-center md:justify-end">
        <DateRangePicker value={currentRange} onChange={onRangeChange} className="w-64" />
      </div>
    </header>
  );
}
