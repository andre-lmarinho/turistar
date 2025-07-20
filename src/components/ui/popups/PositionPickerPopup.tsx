// src/components/ui/popups/PositionPickerPopup.tsx
'use client';

import React, { useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { CloseButton } from '@/components';
import { usePopupOutsideHandler, useEscapeKey } from '@/hooks';

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
  const popupRef = useRef<HTMLDivElement>(null);

  usePopupOutsideHandler({ popupRef, triggerRef, onClose });
  useEscapeKey({ onClose, triggerRef });

  return (
    <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true, escapeDeactivates: false }}>
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="position-picker-popup-title"
        tabIndex={-1}
        className="w-[200px] bg-[var(--background)] rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
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
                className={`w-full text-left rounded px-2 py-1 hover:bg-accent ${selected === i ? 'bg-accent' : ''}`}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </FocusTrap>
  );
}
