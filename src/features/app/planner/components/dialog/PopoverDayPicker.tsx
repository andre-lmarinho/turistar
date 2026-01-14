"use client";

import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import { PopoverContent, PopoverHeader } from "@/shared/ui/popover";

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
  titleId = "day-picker-popover-title",
  days,
  selectedDayId,
  onSelectDay,
  positions,
  selectedIndex,
  onSelectIndex,
}: DayPickerPopoverProps) {
  return (
    <PopoverContent side="bottom" align="start" sideOffset={8} className="w-72 p-0" aria-labelledby={titleId}>
      <PopoverHeader title="Change Day" titleId={titleId} />
      <div className="flex gap-2 p-4">
        <div className="w-[65%]">
          <label htmlFor="day-select" className="text-xs font-bold">
            Day
          </label>
          <select
            id="day-select"
            value={selectedDayId}
            onChange={(event) => onSelectDay(event.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm">
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
            className="mt-1 w-full rounded border px-2 py-1 text-sm">
            {positions.map((position) => (
              <option key={position} value={position}>
                {position + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </PopoverContent>
  );
}
