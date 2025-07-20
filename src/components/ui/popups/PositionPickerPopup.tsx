// src/components/ui/popups/PositionPickerPopup.tsx
'use client';

import React from 'react';
import { CloseButton, Popup } from '@/components';

interface Props {
  total: number;
  selected?: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export default function PositionPickerPopup({
  total,
  selected,
  onSelect,
  onClose,
  triggerRef,
}: Props) {
  return (
    <Popup
      triggerRef={triggerRef}
      onClose={onClose}
      size="sm"
      aria-labelledby="position-picker-popup-title"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 id="position-picker-popup-title" className="font-bold">
          Change Position
        </h3>
        <CloseButton onClick={onClose} />
      </div>
      <ul className="space-y-1">
        {Array.from({ length: total }).map((_, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              className={`w-full text-left rounded px-2 py-1 hover:bg-accent ${
                selected === i ? 'bg-accent' : ''
              }`}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ul>
    </Popup>
  );
}
