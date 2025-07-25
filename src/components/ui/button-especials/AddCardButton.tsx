// src/components/ui/button-especials/AddCardButton.tsx
'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { DEFAULT_NEW_CARD_COLOR_INDEX, DEFAULT_COLORS, KEY_BINDS } from '@/constants';
import { Tooltip } from '@/components';

export type AddCardButtonPosition = 'new' | 'insert';

export interface AddCardButtonProps {
  dayId: string;
  index?: number;
  position: AddCardButtonPosition;
  onAddActivity: (dayId: string, index?: number) => void;
}

export default function AddCardButton({
  dayId,
  index,
  position,
  onAddActivity,
}: AddCardButtonProps) {
  const { bg: baseBg, border: borderColor } = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX];

  if (position === 'new') {
    const baseColor = baseBg;

    const button = (
      <button
        type="button"
        onClick={() => onAddActivity(dayId, index)}
        className={`p-2 cursor-pointer ${borderColor} ${baseColor} bg-background flex items-center w-full h-10 rounded-lg transition`}
      >
        <Plus size={18} aria-hidden="true" className="mr-2" />
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          New Card
        </span>
      </button>
    );
    return (
      <Tooltip
        content={
          <>
            New Card{' '}
            <kbd className="bg-white text-gray-800 text-xs font-medium px-1 py-0.5 rounded">
              {KEY_BINDS.newCard.toUpperCase()}
            </kbd>
          </>
        }
        position="bottom"
      >
        {button}
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAddActivity(dayId, index)}
      aria-label="Insert new card"
      className={`h-2 group cursor-pointer relative flex justify-center items-center w-full transition z-20`}
    >
      <span className="sr-only">Insert new card</span>
      <Plus
        size={24}
        aria-hidden="true"
        className={` bg-background rounded transition-opacity w-6 h-5 opacity-0 z-20 group-hover:opacity-100 shadow-md`}
      />
      <span className="absolute border-t-2 border-dashed border-gray-300 opacity-0 group-hover:opacity-100 w-[90%] transition"></span>
    </button>
  );
}
