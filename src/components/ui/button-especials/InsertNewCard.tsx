// src/components/ui/InsertNewCard.tsx

'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { DEFAULT_NEW_CARD_COLOR_INDEX, COLOR_FOREGROUND_VALUES } from '@/constants';

interface InsertNewCardProps {
  dayId: string;
  index?: number;
  onAddActivity: (dayId: string, index?: number) => void;
}

export default function InsertNewCard({ dayId, index, onAddActivity }: InsertNewCardProps) {
  const foregroundColor = COLOR_FOREGROUND_VALUES[DEFAULT_NEW_CARD_COLOR_INDEX];

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
        className={` bg-white rounded transition-opacity w-6 h-5 opacity-0 z-20 group-hover:opacity-100 shadow-md`}
        style={{ color: foregroundColor }}
      />
      <span className="absolute border-t-2 border-dashed border-gray-300 opacity-0 group-hover:opacity-100 w-[90%] transition"></span>
    </button>
  );
}
