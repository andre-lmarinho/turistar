// src/components/planner/dnd/ActivityCardEditing.tsx
'use client';

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { Activity, DayPlan } from '@/types';
import { Button, CardColorsPopup, DayPickerPopup } from '@/components';
import { usePopupTriggerRef, useWindowSize } from '@/hooks';
import { cn } from '@/lib/utils';

interface Props {
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
  onChangeDay: (dayId: string) => void;
  onSave: () => void;
  onCancel: () => void;
  editedImageUrl: string;
  setEditedImageUrl: (url: string) => void;
  cardRef: React.RefObject<HTMLElement>;
}

export default function ActivityCardEditing({
  activity,
  availableDays,
  bgColor,
  onChangeColor,
  onChangeDay,
  onSave,
  cardRef,
}: Props) {
  const colorButtonRef = usePopupTriggerRef();
  const dateButtonRef = usePopupTriggerRef();
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const cardRect = useWindowSize(cardRef);
  const buttonRect = useWindowSize(buttonContainerRef);

  const gap = 8;
  const buttonGroupWidth = buttonRect?.width ?? 160;

  const position =
    cardRect && window.innerWidth - cardRect.right - gap >= buttonGroupWidth ? 'right' : 'left';

  const coords = cardRect
    ? {
        top: cardRect.top,
        left: position === 'right' ? cardRect.right + gap : cardRect.left - gap - buttonGroupWidth,
      }
    : null;

  if (!coords) return null;

  return (
    <>
      <div className="relative mt-2 z-50 flex">
        <Button type="button" size="sm" className="cursor-pointer" onClick={onSave}>
          Update
        </Button>
      </div>
      {ReactDOM.createPortal(
        <div
          ref={buttonContainerRef}
          className={cn(
            'fixed z-50 flex flex-col gap-1',
            position === 'right' ? 'items-start' : 'items-end'
          )}
          style={{ top: coords.top, left: coords.left }}
        >
          <Button
            ref={dateButtonRef}
            size="sm"
            variant="icon"
            type="button"
            onClick={() => {
              setIsDatePickerOpen((p) => !p);
              setIsColorPickerOpen(false);
            }}
          >
            Move
            <ChevronDown className="size-4" />
          </Button>
          <div className="relative mb-1">
            {isDatePickerOpen && availableDays?.length > 0 && (
              <div className="absolute top-1 left-full z-50">
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

          <Button
            ref={colorButtonRef}
            size="sm"
            variant="icon"
            type="button"
            onClick={() => {
              setIsColorPickerOpen((prev) => !prev);
              setIsDatePickerOpen(false);
            }}
          >
            Card Colors
            <ChevronDown className="size-4" />
          </Button>
          <div className="relative mb-1">
            {isColorPickerOpen && (
              <div className="absolute top-1 left-full z-50">
                <CardColorsPopup
                  imageUrl={editedImageUrl}
                  onChangeImage={(url: string) => setEditedImageUrl(url)}
                  onClearImage={() => setEditedImageUrl('')}
                  selectedColor={bgColor}
                  onChangeColor={(selectedColor: string) => {
                    onChangeColor(selectedColor);
                    setIsColorPickerOpen(false);
                  }}
                  onClose={() => setIsColorPickerOpen(false)}
                  triggerRef={colorButtonRef}
                />
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
