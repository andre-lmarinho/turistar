// src/components/ui/popups/DayPickerPopup.tsx
'use client';

import React from 'react';
import type { DayPlan } from '@/types';
import { CloseButton, Popup } from '@/components';

interface Props {
  days: DayPlan[];
  selected?: string;
  onSelect: (dayId: string) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export default function DayPickerPopup({ days, selected, onSelect, onClose, triggerRef }: Props) {
  return (
    <Popup
      triggerRef={triggerRef}
      onClose={onClose}
      size="sm"
      aria-labelledby="day-picker-popup-title"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 id="day-picker-popup-title" className="font-bold">
          Change Day
        </h3>
        <CloseButton onClick={onClose} />
      </div>
      <ul className="space-y-1">
        {days.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onSelect(d.id)}
              className={`w-full text-left rounded px-2 py-1 hover:bg-accent ${
                selected === d.id ? 'bg-accent' : ''
              }`}
            >
              {d.label}
            </button>
          </li>
        ))}
      </ul>
    </Popup>
  );
}
