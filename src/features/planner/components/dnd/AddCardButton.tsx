'use client';

import React from 'react';
import { Plus } from '@/shared/ui/icon';

type AddCardButtonPosition = 'new' | 'insert';

interface AddCardButtonProps {
  dayId: string;
  index?: number;
  position: AddCardButtonPosition;
  onAddActivity: (dayId: string, index?: number) => void;
}

export function AddCardButton({ dayId, index, position, onAddActivity }: AddCardButtonProps) {
  if (position === 'new') {
    return (
      <button
        type="button"
        onClick={() => onAddActivity(dayId, index)}
        className={`hover:bg-card flex h-10 w-full cursor-pointer items-center rounded-lg p-2 transition`}
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
      className={`group relative z-50 flex h-2 w-full cursor-pointer items-center justify-center transition`}
    >
      <span className="sr-only">Insert new card</span>
      <Plus
        size={24}
        aria-hidden="true"
        className={`bg-card z-50 h-5 w-6 rounded opacity-0 shadow-md transition-opacity group-hover:opacity-100`}
      />
      <span className="border-border absolute w-full border-t-2 border-dashed opacity-0 transition group-hover:opacity-100"></span>
    </button>
  );
}
