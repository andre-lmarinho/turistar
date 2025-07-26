// src/components/ui/popups/DayPickerPopup.tsx
'use client';

import React from 'react';
import type { DayPlan } from '@/types';
import { CloseButton, Popup } from '@/components';

interface Props {
  days: DayPlan[];
  selected?: string;
  onSelect: (dayId: string) => void;
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export default function DayPickerPopup({
  days,
  selected,
  onSelect,
  selectedIndex,
  onSelectIndex,
  onClose,
  triggerRef,
}: Props) {
  const positions = React.useMemo(() => {
    const day = days.find((d) => d.id === selected);
    return Array.from({ length: day?.activities.length ?? 0 });
  }, [days, selected]);

  return (
    <Popup
      triggerRef={triggerRef}
      onClose={onClose}
      size="md"
      aria-labelledby="day-picker-popup-title"
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id="day-picker-popup-title" className="font-bold">
          Change Day
        </h3>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flex gap-2 p-4">
        <div className="w-[65%]">
          <label htmlFor="day-select" className="text-xs font-bold">
            Day
          </label>
          <select
            id="day-select"
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm"
          >
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[30%]">
          <label htmlFor="position-select" className="maw-w-[5rem] text-xs font-bold">
            Position
          </label>
          <select
            id="position-select"
            value={selectedIndex}
            onChange={(e) => onSelectIndex?.(Number(e.target.value))}
            className="w-full rounded border px-2 py-1 text-sm"
          >
            {positions.map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Popup>
  );
}
