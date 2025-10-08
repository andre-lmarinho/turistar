// src/features/planner/components/dnd/ActivityCardEditing.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { useActivityPopupControls } from '@/features/planner/hooks/internal/useActivityPopupControls';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
import { usePopupDismiss } from '@/shared/hooks/ui/usePopupDismiss';
import { cn } from '@/shared/utils/cn';

interface Props {
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onSave: (imageUrl: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  editedImageUrl: string;
  setEditedImageUrl: (url: string) => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function ActivityCardEditing({
  activity,
  availableDays,
  bgColor,
  onChangeColor,
  onChangeDay,
  onChangePosition,
  onSave,
  onCancel,
  onDelete,
  editedImageUrl,
  setEditedImageUrl,
  cardRef,
}: Props) {
  const { colorPopover, dayPopover } = useActivityPopupControls({
    activity,
    availableDays,
    bgColor,
    imageUrl: editedImageUrl,
    onChangeColor,
    onChangeDay,
    onChangePosition,
    onChangeImage: (url: string) => setEditedImageUrl(url),
    onClearImage: () => setEditedImageUrl(''),
  });
  const { rect: cardRect } = useElementMeasure({ ref: cardRef, rect: true });
  const { ref: buttonContainerRef, rect: buttonRect } = useElementMeasure<HTMLDivElement>({
    rect: true,
  });

  usePopupDismiss({ popupRef: buttonContainerRef, triggerRef: cardRef, onClose: onCancel });

  const gap = 8;
  const buttonGroupWidth = buttonRect?.width ?? 160;

  const position =
    cardRect && window.innerWidth - cardRect.right - gap >= buttonGroupWidth ? 'right' : 'left';

  const coords = cardRect
    ? {
        top: cardRect.top,
        left: position === 'right' ? cardRect.right + gap : cardRect.left - gap,
      }
    : null;

  const popoverSide = position === 'right' ? 'right' : 'left';

  if (!coords) return null;

  return (
    <>
      <div className="relative z-50 mt-2 flex">
        <Button
          type="button"
          size="sm"
          className="cursor-pointer"
          onClick={() => onSave(editedImageUrl)}
        >
          Update
        </Button>
      </div>
      {ReactDOM.createPortal(
        <div
          ref={buttonContainerRef}
          className={cn(
            'fixed z-50 flex flex-col',
            position === 'right' ? 'items-start' : '-translate-x-full items-end'
          )}
          style={{ top: coords.top, left: coords.left }}
        >
          <Popover open={dayPopover.open} onOpenChange={dayPopover.onOpenChange}>
            <PopoverTrigger asChild>
              <Button
                ref={dayPopover.triggerRef}
                size="sm"
                variant="icon"
                type="button"
                icon="arrow-left-right"
                iconProps={{ className: 'size-4' }}
              >
                Move
              </Button>
            </PopoverTrigger>
            {dayPopover.content ? (
              <PopoverContent tone="plain" side={popoverSide} align="start" sideOffset={8}>
                {dayPopover.content}
              </PopoverContent>
            ) : null}
          </Popover>

          <Popover open={colorPopover.open} onOpenChange={colorPopover.onOpenChange}>
            <PopoverTrigger asChild>
              <Button
                ref={colorPopover.triggerRef}
                size="sm"
                variant="icon"
                type="button"
                icon="palette"
                iconProps={{ className: 'size-4' }}
              >
                Card Colors
              </Button>
            </PopoverTrigger>
            <PopoverContent tone="plain" side={popoverSide} align="start" sideOffset={8}>
              {colorPopover.content}
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            variant="icon"
            type="button"
            onClick={onDelete}
            icon="trash-2"
            iconProps={{ className: 'size-4' }}
          >
            Delete
          </Button>
        </div>,
        document.body
      )}
    </>
  );
}
