'use client';

import React from 'react';
import { Plus } from '@/shared/ui/icon';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_COLORS,
} from '@/features/planner/domain/constants/colors';

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
  const { border: borderColor } = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX];

  if (position === 'new') {
    return (
      <button
        type="button"
        onClick={() => onAddActivity(dayId, index)}
        className={`cursor-pointer border ${borderColor} bg-background hover:bg-border flex h-10 w-full items-center rounded-lg p-2 transition`}
      >
        <Plus size={18} aria-hidden="true" className="mr-2" />
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          New Card
        </span>
      </button>
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
      <span className="border-border absolute w-[90%] border-t-2 border-dashed opacity-0 transition group-hover:opacity-100"></span>
    </button>
  );
}
