'use client';

import React, { useState, useEffect } from 'react';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import Image from 'next/image';
import { useActivityPopupControls } from '@/features/planner/hooks/internal/useActivityPopupControls';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';

import { Button } from '@/shared/ui/button';
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
          <Button
            variant="icon"
            size="sm"
            className={`absolute right-2 bottom-2 z-20 text-xs ${showRemove ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowRemove(false);
              setEditedImageUrl('');
              onImageChange('');
            }}
          >
            Remove photo
          </Button>
        )}

        {/* Header buttons */}
        <div className="relative z-10 flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Popover open={dayPopover.open} onOpenChange={dayPopover.onOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  ref={dayPopover.triggerRef}
                  size="sm"
                  variant="icon"
                  type="button"
                  className="text-xs"
                  icon="chevron-down"
                  iconPosition="right"
                  iconProps={{ className: 'size-4' }}
                >
                  {currentDayLabel ?? 'Change Day'}
                </Button>
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
            <Button variant="icon" size="icon" title="Delete" icon="trash-2" onClick={onDelete} />
            <Popover open={colorPopover.open} onOpenChange={colorPopover.onOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  ref={colorPopover.triggerRef}
                  variant="icon"
                  size="icon"
                  title="Card Color"
                  icon="palette"
                />
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
            <Button variant="icon" size="icon" title="Close" icon="x" onClick={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}
