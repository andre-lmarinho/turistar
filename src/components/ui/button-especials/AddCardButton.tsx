// src/components/ui/button-especials/AddCardButton.tsx
'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_COLORS,
  COLOR_HOVER_CLASSES,
  COLOR_FOREGROUND_VALUES,
  COLOR_BORDER_CLASSES,
} from '@/constants';

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
  const foregroundColor = COLOR_FOREGROUND_VALUES[DEFAULT_NEW_CARD_COLOR_INDEX];

  if (position === 'new') {
    const baseColor = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX];
    const hoverColor = COLOR_HOVER_CLASSES[DEFAULT_NEW_CARD_COLOR_INDEX];
    const borderColor = COLOR_BORDER_CLASSES[DEFAULT_NEW_CARD_COLOR_INDEX];

    return (
      <button
        type="button"
        onClick={() => onAddActivity(dayId, index)}
        className={`p-2 cursor-pointer ${borderColor} ${baseColor} bg-background ${hoverColor} flex items-center w-full h-10 rounded-lg transition`}
      >
        <Plus size={18} aria-hidden="true" className="mr-2" style={{ color: foregroundColor }} />
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
      className={`h-2 group cursor-pointer relative flex justify-center items-center w-full transition z-20`}
    >
      <span className="sr-only">Insert new card</span>
      <Plus
        size={24}
        aria-hidden="true"
        className={` bg-white rounded transition-opacity w-6 h-5 opacity-0 z-20 group-hover:opacity-100 shadow-md`}
        style={{ color: foregroundColor }}
      />
      <span className="absolute border-t-2 border-dashed border-gray-300 opacity-0 group-hover:opacity-100 w-[90%] transition"></span>
    </button>
  );
}
