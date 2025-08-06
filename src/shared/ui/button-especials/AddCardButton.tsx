// src/components/ui/button-especials/AddCardButton.tsx
'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { DEFAULT_NEW_CARD_COLOR_INDEX, DEFAULT_COLORS, KEY_BINDS } from '@/shared/constants';
import { TooltipKeyHint } from '@/shared/ui';

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
        className={`cursor-pointer p-2 ${borderColor} ${baseColor} bg-background flex h-10 w-full items-center rounded-lg transition`}
      >
        <Plus size={18} aria-hidden="true" className="mr-2" />
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          New Card
        </span>
      </button>
    );
    return (
      <TooltipKeyHint shortcut={KEY_BINDS.newCard} content="New Card" position="bottom">
        {button}
      </TooltipKeyHint>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAddActivity(dayId, index)}
      aria-label="Insert new card"
      className={`group relative z-20 flex h-2 w-full cursor-pointer items-center justify-center transition`}
    >
      <span className="sr-only">Insert new card</span>
      <Plus
        size={24}
        aria-hidden="true"
        className={`bg-background z-20 h-5 w-6 rounded opacity-0 shadow-md transition-opacity group-hover:opacity-100`}
      />
      <span className="absolute w-[90%] border-t-2 border-dashed border-gray-300 opacity-0 transition group-hover:opacity-100"></span>
    </button>
  );
}
