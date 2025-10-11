'use client';

import { ArrowLeftRight, Palette, Trash2 } from '@/shared/ui/icon';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
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
        <button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
          onClick={() => onSave(editedImageUrl)}
        >
          Update
        </button>
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
                  <button
                    ref={dayPopover.triggerRef}
                    type="button"
                    className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <ArrowLeftRight className="size-4" aria-hidden="true" />
                    Move
                  </button>
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
                  <button
                    ref={colorPopover.triggerRef}
                    type="button"
                    className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <Palette className="size-4" aria-hidden="true" />
                    Card Colors
                  </button>
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

              <button
                type="button"
                onClick={onDelete}
                className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
