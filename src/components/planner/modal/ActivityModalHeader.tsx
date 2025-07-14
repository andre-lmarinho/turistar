// src/components/planner/modal/ActivityModalHeader.tsx
'use client';

import React, { useState } from 'react';
import type { Activity, DayPlan } from '@/types';
import { useCardPopups } from '@/hooks';
import { ChevronDown } from 'lucide-react';

import {
  Button,
  RemoveCardButton,
  CloseButton,
  CardColorButton,
  CardColorsPopup,
  DayPickerPopup,
} from '@/components';

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
}: {
  activity: Activity & { dayId?: string };
  bgColor: string;
  onDelete: () => void;
  onClose: () => void;
  onColorChange: (color: string) => void;
  availableDays: DayPlan[];
  onChangeDay: (dayId: string) => void;
}) {
  const {
    colorButtonRef,
    dateButtonRef,
    isColorPickerOpen,
    isDatePickerOpen,
    handleColorButtonClick,
    handleDateButtonClick,
    setIsColorPickerOpen,
    setIsDatePickerOpen,
  } = useCardPopups();
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');

  return (
    <>
      <div
        className={`relative mb-4 rounded-t-lg ${
          editedImageUrl ? 'h-32' : ''
        } ${!editedImageUrl && !bgColor.startsWith('#') ? bgColor : ''}`}
        style={bgColor.startsWith('#') ? { backgroundColor: bgColor } : undefined}
      >
        {editedImageUrl && (
          <img
            src={editedImageUrl}
            alt={activity.title}
            className="absolute top-0 left-0 rounded-t-lg w-full h-full object-cover"
          />
        )}

        {/* Header buttons */}
        <div className="relative z-10 flex items-center justify-between p-2">
          <Button
            ref={dateButtonRef}
            size="sm"
            variant="icon"
            type="button"
            onClick={handleDateButtonClick}
          >
            Change Day
            <ChevronDown className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <RemoveCardButton onClick={onDelete} />
            <CardColorButton ref={colorButtonRef} onClick={handleColorButtonClick} />
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {isColorPickerOpen && (
          <div className="absolute top-[3rem] right-[1rem] z-50">
            <CardColorsPopup
              imageUrl={editedImageUrl}
              onChangeImage={(url: string) => setEditedImageUrl(url)}
              onClearImage={() => setEditedImageUrl('')}
              selectedColor={bgColor}
              onChangeColor={(selectedColor: string) => {
                onColorChange(selectedColor);
                setIsColorPickerOpen(false);
              }}
              onClose={() => setIsColorPickerOpen(false)}
              triggerRef={colorButtonRef}
            />
          </div>
        )}
        {isDatePickerOpen && availableDays?.length > 0 && (
          <div className="absolute top-[3rem] left-[1rem] z-50">
            <DayPickerPopup
              days={availableDays}
              selected={activity.dayId}
              onSelect={(dayId: string) => {
                onChangeDay(dayId);
                setIsDatePickerOpen(false);
              }}
              onClose={() => setIsDatePickerOpen(false)}
              triggerRef={dateButtonRef}
            />
          </div>
        )}
      </div>
    </>
  );
}
