// src/components/ui/popups/DayPickerPopup.tsx

'use client';

import React, { useRef } from 'react';
import type { DayPlan } from '@/types';
import { CloseButton } from '@/components';
import { usePopupOutsideHandler } from '@/hooks';

interface Props {
  days: DayPlan[];
  selected?: string;
  onSelect: (dayId: string) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export default function DayPickerPopup({ days, selected, onSelect, onClose, triggerRef }: Props) {
  const popupRef = useRef<HTMLDivElement>(null);

  usePopupOutsideHandler({
    popupRef,
    triggerRef,
    onClose,
  });

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-picker-popup-title"
      className="w-[200px] bg-[var(--background)] rounded-lg shadow-xl"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 id="card-color-popup-title" className="font-bold">
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
    </div>
  );
}
