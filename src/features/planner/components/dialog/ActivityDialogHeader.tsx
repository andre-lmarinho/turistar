'use client';

import React, { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Palette, Trash2, X } from '@/shared/ui/icon';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { Popover, PopoverTrigger } from '@/shared/ui/popover';
import { DEFAULT_COLORS } from '@/features/planner/domain/constants/colors';
import { MAX_FILE_SIZE } from '@/shared/constants/ui';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';
import { useCardPopups } from '@/features/planner/hooks/internal/useCardPopups';
import { CardColorsPopover } from './PopoverCardColors';
import { DayPickerPopover } from './PopoverDayPicker';

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
  const [showRemove, setShowRemove] = useState(false);
  const uploadInputId = useId();

  const { colorButtonRef, dateButtonRef, activePopup, setActivePopup } = useCardPopups();

  const currentDay = availableDays.find((day) => day.id === activity.dayId);
  const currentIndex = currentDay?.activities.findIndex((act) => act.id === activity.id) ?? -1;
  const dayPositions = currentDay ? currentDay.activities.map((_, index) => index) : [];

  const closePopovers = () => setActivePopup(null);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    closePopovers();
  };

  const handleRemoveImage = () => {
    setEditedImageUrl('');
    onImageChange('');
  };

  const handleUploadImage = (file: File) => {
    if (file.size > MAX_FILE_SIZE) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditedImageUrl(reader.result);
        onImageChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Keep local image state in sync with the selected activity
  useEffect(() => {
    setEditedImageUrl(activity.imageUrl ?? '');
  }, [activity.imageUrl]);

  return (
    <>
      <div
        className={`group relative mb-4 rounded-t-lg ${
          editedImageUrl ? 'h-32' : ''
        } ${!editedImageUrl && !bgColor.startsWith('#') ? bgColor : ''}`}
        style={bgColor.startsWith('#') ? { backgroundColor: bgColor } : undefined}
        onClick={() => {
          if (isTouchDevice() && editedImageUrl) setShowRemove((previous) => !previous);
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
            className={`border-border bg-background text-foreground hover:bg-border absolute right-2 bottom-2 z-20 inline-flex cursor-pointer items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors ${showRemove ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(event) => {
              event.stopPropagation();
              setShowRemove(false);
              handleRemoveImage();
            }}
          >
            Remove photo
          </button>
        )}

        {/* Header buttons */}
        <div className="relative z-10 flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Popover
              open={activePopup === 'date'}
              onOpenChange={(open) => setActivePopup(open ? 'date' : null)}
            >
              <PopoverTrigger asChild>
                <button
                  ref={dateButtonRef}
                  type="button"
                  className="border-border bg-background text-foreground hover:bg-border inline-flex cursor-pointer items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition-colors"
                >
                  {availableDays.find((day) => day.id === activity.dayId)?.label ?? 'Change Day'}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              {availableDays.length > 0 ? (
                <DayPickerPopover
                  days={availableDays}
                  selectedDayId={activity.dayId}
                  onSelectDay={(dayId) => {
                    onChangeDay(dayId);
                    closePopovers();
                  }}
                  positions={dayPositions}
                  selectedIndex={currentIndex >= 0 ? currentIndex : undefined}
                  onSelectIndex={(index) => onChangePosition(index)}
                />
              ) : null}
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Delete"
              onClick={onDelete}
              className="bg-background text-foreground hover:bg-border hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sr-only">Delete</span>
            </button>
            <Popover
              open={activePopup === 'color'}
              onOpenChange={(open) => setActivePopup(open ? 'color' : null)}
            >
              <PopoverTrigger asChild>
                <button
                  ref={colorButtonRef}
                  type="button"
                  title="Card Color"
                  className="bg-background text-foreground hover:bg-border hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                >
                  <Palette className="size-4" aria-hidden="true" />
                  <span className="sr-only">Card color</span>
                </button>
              </PopoverTrigger>
              <CardColorsPopover
                imageUrl={editedImageUrl}
                onRemoveImage={handleRemoveImage}
                colors={DEFAULT_COLORS}
                selectedColor={bgColor}
                onSelectColor={handleColorSelect}
                uploadInputId={uploadInputId}
                onUploadImage={handleUploadImage}
              />
            </Popover>
            <button
              type="button"
              title="Close"
              onClick={onClose}
              className="bg-background text-foreground hover:bg-border hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
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
