'use client';

import React from 'react';
import {
  DEFAULT_NEW_CARD_COLOR_INDEX,
  DEFAULT_COLORS,
} from '@/features/planner/domain/constants/colors';
import { KEY_BINDS } from '@/features/planner/domain/constants/keyBinds';
import TooltipKeyHint from '@/shared/ui/TooltipKeyHint';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';
import { lucideIcons } from '@/shared/ui/icon';

const PlusIcon = lucideIcons.plus;

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
      <Button
        type="button"
        variant="plannerAddCard"
        className={cn(baseColor, borderColor)}
        icon="plus"
        onClick={() => onAddActivity(dayId, index)}
      >
        New Card
      </Button>
    );
    return (
      <TooltipKeyHint shortcut={KEY_BINDS.newCard} content="New Card" position="bottom">
        {button}
      </TooltipKeyHint>
    );
  }

  return (
    <Button
      type="button"
      variant="plannerInsertCard"
      onClick={() => onAddActivity(dayId, index)}
      aria-label="Insert new card"
    >
      <span className="sr-only">Insert new card</span>
      <PlusIcon
        size={24}
        aria-hidden="true"
        className="bg-background z-20 h-5 w-6 rounded opacity-0 shadow-md transition-opacity group-hover:opacity-100"
      />
      <span className="border-border absolute w-[90%] border-t-2 border-dashed opacity-0 transition group-hover:opacity-100"></span>
    </Button>
  );
}
