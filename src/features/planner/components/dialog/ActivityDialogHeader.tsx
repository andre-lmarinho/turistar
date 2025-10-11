'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Palette, Trash2, X } from 'lucide-react';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import Image from 'next/image';
import { useActivityPopupControls } from '@/features/planner/hooks/internal/useActivityPopupControls';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

/**
 * Color strip shown at the very top of ActivityDialog.
 * - Background colour = current card colour.
 */
export default function ActivityDialogHeader({
  activity,
  bgColor,
  onDelete,
  onClose,
  onColorChange,
  availableDays,
  onChangeDay,
  onChangePosition,
  onImageChange,
}: {
  activity: Activity & { dayId?: string };
  bgColor: string;
  onDelete: () => void;
  onClose: () => void;
  onColorChange: (color: string) => void;
  availableDays: DayPlan[];
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onImageChange: (url: string) => void;
}) {
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');

  const { colorPopover, dayPopover } = useActivityPopupControls({
    activity,
    availableDays,
    bgColor,
    imageUrl: editedImageUrl,
    onChangeColor: onColorChange,
    onChangeDay,
    onChangePosition,
    onChangeImage: (url: string) => {
      setEditedImageUrl(url);
      onImageChange(url);
    },
    onClearImage: () => {
      setEditedImageUrl('');
      onImageChange('');
    },
  });
  const [showRemove, setShowRemove] = useState(false);

  // Keep local image state in sync with the selected activity
  useEffect(() => {
    setEditedImageUrl(activity.imageUrl ?? '');
  }, [activity.imageUrl]);

  const currentDayLabel = availableDays.find((d) => d.id === activity.dayId)?.label;

  return (
    <>
      <div
        className={`group relative mb-4 rounded-t-lg ${
          editedImageUrl ? 'h-32' : ''
        } ${!editedImageUrl && !bgColor.startsWith('#') ? bgColor : ''}`}
        style={bgColor.startsWith('#') ? { backgroundColor: bgColor } : undefined}
        onClick={() => {
          if (isTouchDevice() && editedImageUrl) setShowRemove((p) => !p);
        }}
      >
        {editedImageUrl && (
          <Image
            src={editedImageUrl}
            alt={activity.title}
            className="absolute top-0 left-0 h-full w-full rounded-t-lg object-cover"
            width={400}
            height={200}
          />
        )}
        {editedImageUrl && (
          <button
            type="button"
            className={`bg-background/80 text-foreground hover:bg-background absolute right-2 bottom-2 z-20 inline-flex items-center rounded-md px-3 py-1 text-xs font-medium transition-colors ${showRemove ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowRemove(false);
              setEditedImageUrl('');
              onImageChange('');
            }}
          >
            Remove photo
          </button>
        )}

        {/* Header buttons */}
        <div className="relative z-10 flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Popover open={dayPopover.open} onOpenChange={dayPopover.onOpenChange}>
              <PopoverTrigger asChild>
                <button
                  ref={dayPopover.triggerRef}
                  type="button"
                  className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition-colors"
                >
                  {currentDayLabel ?? 'Change Day'}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              {dayPopover.content ? (
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  className="w-72 p-0"
                  aria-labelledby="day-picker-popup-title"
                >
                  {dayPopover.content}
                </PopoverContent>
              ) : null}
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Delete"
              onClick={onDelete}
              className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sr-only">Delete</span>
            </button>
            <Popover open={colorPopover.open} onOpenChange={colorPopover.onOpenChange}>
              <PopoverTrigger asChild>
                <button
                  ref={colorPopover.triggerRef}
                  type="button"
                  title="Card Color"
                  className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors"
                >
                  <Palette className="size-4" aria-hidden="true" />
                  <span className="sr-only">Card color</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                sideOffset={8}
                className="w-[304px] p-0"
                aria-labelledby="card-color-popup-title"
              >
                {colorPopover.content}
              </PopoverContent>
            </Popover>
            <button
              type="button"
              title="Close"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
