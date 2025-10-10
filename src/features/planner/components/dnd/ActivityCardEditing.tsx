'use client';

import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { Button } from '@/shared/ui/button';
import { useActivityPopupControls } from '@/features/planner/hooks/internal/useActivityPopupControls';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
import { cn } from '@/shared/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

interface Props {
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onSave: (imageUrl: string) => void;
  onDelete: () => void;
  editedImageUrl: string;
  setEditedImageUrl: (url: string) => void;
  cardRect: DOMRect | null;
  actionsRef: React.RefObject<HTMLDivElement | null>;
}

export default function ActivityCardEditing({
  activity,
  availableDays,
  bgColor,
  onChangeColor,
  onChangeDay,
  onChangePosition,
  onSave,
  onDelete,
  editedImageUrl,
  setEditedImageUrl,
  cardRect,
  actionsRef,
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

  const { rect: buttonRect } = useElementMeasure<HTMLDivElement>({ ref: actionsRef, rect: true });

  const gap = 8;
  const buttonGroupWidth = buttonRect?.width ?? 160;

  const position = useMemo(() => {
    if (!cardRect) return 'right';
    const availableRight = window.innerWidth - cardRect.right - gap;
    return availableRight >= buttonGroupWidth ? 'right' : 'left';
  }, [buttonGroupWidth, cardRect]);

  const coords = useMemo(() => {
    if (!cardRect) return null;
    return {
      top: cardRect.top,
      left: position === 'right' ? cardRect.right + gap : cardRect.left - gap,
    };
  }, [cardRect, position]);

  return (
    <>
      <div className="relative z-50 mt-2 flex">
        <Button type="button" size="sm" className="cursor-pointer" onClick={() => onSave(editedImageUrl)}>
          Update
        </Button>
      </div>
      {coords
        ? ReactDOM.createPortal(
            <div
              ref={actionsRef}
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
                  <PopoverContent
                    side="right"
                    align="center"
                    sideOffset={8}
                    className="w-72 p-0"
                    aria-labelledby="day-picker-popup-title"
                  >
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
                <PopoverContent
                  side="right"
                  align="center"
                  sideOffset={8}
                  className="w-[304px] p-0"
                  aria-labelledby="card-color-popup-title"
                >
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
          )
        : null}
    </>
  );
}
