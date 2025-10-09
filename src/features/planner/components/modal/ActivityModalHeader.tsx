// src/features/planner/components/modal/ActivityModalHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import Image from 'next/image';
import { useActivityPopupControls } from '@/features/planner/hooks/internal/useActivityPopupControls';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';

import { Button } from '@/shared/ui/button';

/**
 * Color strip shown at the very top of ActivityModal.
 * - Background colour = current card colour.
 */
export default function ActivityModalHeader({
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

  const {
    colorButtonRef,
    dateButtonRef,
    handleColorButtonClick,
    handleDateButtonClick,
    ColorPopup,
    DayPopup,
  } = useActivityPopupControls({
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
            size="sm"
            variant="outline"
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
            <Button
              ref={dateButtonRef}
              size="sm"
              variant="outline"
              type="button"
              onClick={handleDateButtonClick}
              className="text-xs"
              icon="chevron-down"
              iconPosition="right"
              iconProps={{ className: 'size-4' }}
            >
              {currentDayLabel ?? 'Change Day'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" title="Delete" icon="trash-2" onClick={onDelete} />
            <Button
              ref={colorButtonRef}
              variant="outline"
              size="icon"
              title="Card Color"
              icon="palette"
              onClick={handleColorButtonClick}
            />
            <Button variant="outline" size="icon" title="Close" icon="x" onClick={onClose} />
          </div>
        </div>

        {ColorPopup && <div className="absolute top-[3rem] right-[1rem] z-50">{ColorPopup}</div>}
        {DayPopup && <div className="absolute top-[3rem] left-[1rem] z-50">{DayPopup}</div>}
      </div>
    </>
  );
}
