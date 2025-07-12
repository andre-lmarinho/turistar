// src/components/ui/AddNewCard.tsx

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

interface AddNewCardProps {
  dayId: string;
  index?: number;
  onAddActivity: (dayId: string, index?: number) => void;
}

export default function AddNewCard({ dayId, index, onAddActivity }: AddNewCardProps) {
  const baseColor = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX];
  const hoverColor = COLOR_HOVER_CLASSES[DEFAULT_NEW_CARD_COLOR_INDEX];
  const foregroundColor = COLOR_FOREGROUND_VALUES[DEFAULT_NEW_CARD_COLOR_INDEX];
  const borderColor = COLOR_BORDER_CLASSES[DEFAULT_NEW_CARD_COLOR_INDEX];

  return (
    <button
      type="button"
      onClick={() => onAddActivity(dayId, index)}
      className={`p-2 cursor-pointer ${borderColor} ${baseColor} bg-background ${hoverColor} flex items-center w-full h-10 rounded-lg transition`}
    >
      <Plus size={18} className="mr-2" style={{ color: foregroundColor }} />

      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        New Card
      </span>
    </button>
  );
}
