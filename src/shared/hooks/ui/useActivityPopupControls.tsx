// src/shared/hooks/ui/useActivityPopupControls.ts
'use client';

import React from 'react';
import type { Activity, DayPlan } from '@/shared/types';
import CardColorsPopup from '@/shared/ui/popups/CardColorsPopup';
import DayPickerPopup from '@/shared/ui/popups/DayPickerPopup';
import { useCardPopups } from './useCardPopups';

interface Props {
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  bgColor: string;
  imageUrl?: string;
  onChangeColor: (color: string) => void;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onChangeImage?: (url: string) => void;
  onClearImage?: () => void;
}

/**
 * Provides refs and popup components for activity cards.
 * Encapsulates color and day picker logic to reduce duplication.
 */
export function useActivityPopupControls({
  activity,
  availableDays,
  bgColor,
  imageUrl,
  onChangeColor,
  onChangeDay,
  onChangePosition,
  onChangeImage,
  onClearImage,
}: Props) {
  const {
    colorButtonRef,
    dateButtonRef,
    activePopup,
    setActivePopup,
    handleColorButtonClick,
    handleDateButtonClick,
  } = useCardPopups();

  const isColorPickerOpen = activePopup === 'color';
  const isDatePickerOpen = activePopup === 'date';

  const currentDay = availableDays.find((d) => d.id === activity.dayId);
  const currentIndex = currentDay?.activities.findIndex((a) => a.id === activity.id) ?? -1;

  const ColorPopup = isColorPickerOpen ? (
    <CardColorsPopup
      imageUrl={imageUrl ?? ''}
      onChangeImage={(url: string) => onChangeImage?.(url)}
      onClearImage={() => onClearImage?.()}
      selectedColor={bgColor}
      onChangeColor={(selectedColor: string) => {
        onChangeColor(selectedColor);
        setActivePopup(null);
      }}
      onClose={() => setActivePopup(null)}
      triggerRef={colorButtonRef}
    />
  ) : null;

  const DayPopup =
    isDatePickerOpen && availableDays.length > 0 ? (
      <DayPickerPopup
        days={availableDays}
        selected={activity.dayId}
        selectedIndex={currentIndex}
        onSelect={(dayId: string) => {
          onChangeDay(dayId);
          setActivePopup(null);
        }}
        onSelectIndex={(idx: number) => onChangePosition(idx)}
        onClose={() => setActivePopup(null)}
        triggerRef={dateButtonRef}
      />
    ) : null;

  return {
    colorButtonRef,
    dateButtonRef,
    handleColorButtonClick,
    handleDateButtonClick,
    ColorPopup,
    DayPopup,
  } as const;
}
