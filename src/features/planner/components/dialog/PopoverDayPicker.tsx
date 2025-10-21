'use client';

import { X } from '@/shared/ui/icon';
import { PopoverClose, PopoverContent } from '@/shared/ui/popover';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

interface DayPickerPopoverProps {
  titleId?: string;
  days: DayPlan[];
  selectedDayId?: string;
  onSelectDay: (dayId: string) => void;
  positions: number[];
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
}

export function DayPickerPopover({
  titleId = 'day-picker-popover-title',
  days,
  selectedDayId,
  onSelectDay,
  positions,
  selectedIndex,
  onSelectIndex,
}: DayPickerPopoverProps) {
  return (
    <PopoverContent
      side="bottom"
      align="start"
      sideOffset={8}
      className="w-72 p-0"
      aria-labelledby={titleId}
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id={titleId} className="font-bold">
          Change Day
        </h3>
        <PopoverClose
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="size-4" aria-hidden="true" />
        </PopoverClose>
      </div>
      <div className="flex gap-2 p-4">
        <div className="w-[65%]">
          <label htmlFor="day-select" className="text-xs font-bold">
            Day
          </label>
          <select
            id="day-select"
            value={selectedDayId}
            onChange={(event) => onSelectDay(event.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[30%]">
          <label htmlFor="position-select" className="text-xs font-bold">
            Position
          </label>
          <select
            id="position-select"
            value={selectedIndex}
            onChange={(event) => onSelectIndex?.(Number(event.target.value))}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          >
            {positions.map((_, index) => (
              <option key={index} value={index}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </PopoverContent>
  );
}
