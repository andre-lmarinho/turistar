// src/components/planner/modal/ActivityModalHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { Activity, DayPlan, CatalogActivity } from '@/types';
import Image from 'next/image';
import { useCardPopups, useFlexibleRef } from '@/hooks';
import { ChevronDown } from 'lucide-react';
import { isTouchDevice } from '@/lib';

import {
  Button,
  RemoveCardButton,
  CloseButton,
  CardColorButton,
  CardColorsPopup,
  DayPickerPopup,
  PositionPickerPopup,
  CatalogSearchPopup,
  SearchCatalogButton,
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
  onChangePosition,
  onCatalogSelect,
}: {
  activity: Activity & { dayId?: string };
  bgColor: string;
  onDelete: () => void;
  onClose: () => void;
  onColorChange: (color: string) => void;
  availableDays: DayPlan[];
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onCatalogSelect: (item: CatalogActivity) => void;
}) {
  const {
    colorButtonRef,
    dateButtonRef,
    positionButtonRef,
    isColorPickerOpen,
    isDatePickerOpen,
    isPositionPickerOpen,
    handleColorButtonClick,
    handleDateButtonClick,
    handlePositionButtonClick,
    setIsColorPickerOpen,
    setIsDatePickerOpen,
    setIsPositionPickerOpen,
  } = useCardPopups();
  const searchButtonRef = useFlexibleRef();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');
  const [showRemove, setShowRemove] = useState(false);

  // Keep local image state in sync with the selected activity
  useEffect(() => {
    setEditedImageUrl(activity.imageUrl ?? '');
  }, [activity.imageUrl]);

  const currentDayLabel = availableDays.find((d) => d.id === activity.dayId)?.label;
  const currentDay = availableDays.find((d) => d.id === activity.dayId);
  const currentIndex = currentDay?.activities.findIndex((a) => a.id === activity.id) ?? -1;
  const totalPositions = currentDay?.activities.length ?? 0;

  return (
    <>
      <div
        className={`relative mb-4 rounded-t-lg group ${
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
            className="absolute top-0 left-0 rounded-t-lg w-full h-full object-cover"
            width={400}
            height={200}
            unoptimized
          />
        )}
        {editedImageUrl && (
          <Button
            variant="icon"
            size="sm"
            className={`absolute bottom-2 right-2 z-20 ${showRemove ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowRemove(false);
              setEditedImageUrl('');
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
              variant="icon"
              type="button"
              onClick={handleDateButtonClick}
            >
              {currentDayLabel ?? 'Change Day'}
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
            <Button
              ref={positionButtonRef}
              size="sm"
              variant="icon"
              type="button"
              onClick={handlePositionButtonClick}
            >
              Change Position
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <RemoveCardButton onClick={onDelete} />
            <CardColorButton ref={colorButtonRef} onClick={handleColorButtonClick} />

            <SearchCatalogButton
              ref={searchButtonRef}
              onClick={() => {
                setIsCatalogOpen((p) => !p);
                setIsColorPickerOpen(false);
                setIsDatePickerOpen(false);
                setIsPositionPickerOpen(false);
              }}
            ></SearchCatalogButton>

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
        {isPositionPickerOpen && totalPositions > 0 && (
          <div className="absolute top-[3rem] left-[9rem] z-50">
            <PositionPickerPopup
              total={totalPositions}
              selected={currentIndex}
              onSelect={(idx: number) => {
                onChangePosition(idx);
                setIsPositionPickerOpen(false);
              }}
              onClose={() => setIsPositionPickerOpen(false)}
              triggerRef={positionButtonRef}
            />
          </div>
        )}
        {isCatalogOpen && (
          <div className="absolute top-[3rem] right-[3rem] z-50">
            <CatalogSearchPopup
              open={isCatalogOpen}
              onSelect={(item) => {
                onCatalogSelect(item);
                setEditedImageUrl(item.image_url || '');
                setIsCatalogOpen(false);
              }}
              onClose={() => setIsCatalogOpen(false)}
              triggerRef={searchButtonRef}
            />
          </div>
        )}
      </div>
    </>
  );
}
