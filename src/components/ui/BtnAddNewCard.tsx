'use client';

import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_COLORS,
  COLOR_HOVER_CLASSES,
  COLOR_FOREGROUND_VALUES,
  COLOR_BORDER_CLASSES,
} from '@/constants/colors';

interface AddNewCardProps {
  dayId: string;
  onAddNew: (dayId: string) => void;
}

export default function AddNewCard({ dayId, onAddNew }: AddNewCardProps) {
  const baseColor = DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX];
  const hoverColor = COLOR_HOVER_CLASSES[DEFAULT_NEW_CARD_COLOR_INDEX];
  const foregroundColor = COLOR_FOREGROUND_VALUES[DEFAULT_NEW_CARD_COLOR_INDEX];
  const borderColor = COLOR_BORDER_CLASSES[DEFAULT_NEW_CARD_COLOR_INDEX];

  return (
    <Button
      type="button"
      onClick={() => onAddNew(dayId)}
      variant="ghost"
      className={`p-2 cursor-pointer ${borderColor} ${baseColor} bg-background ${hoverColor} flex items-center w-full h-10 rounded-lg transition`}
    >
      <FiPlus className="mr-2" style={{ color: foregroundColor }} />

      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        New Card
      </span>
    </Button>
  );
}
