// src/features/planner/hooks/internal/useActivityPopupControls.tsx
'use client';

import React from 'react';
import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import CardColorsPopup from '@/features/planner/ui/popups/CardColorsPopup';
import DayPickerPopup from '@/features/planner/ui/popups/DayPickerPopup';
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
  const { colorButtonRef, dateButtonRef, activePopup, setActivePopup } = useCardPopups();

  const currentDay = availableDays.find((d) => d.id === activity.dayId);
  const currentIndex = currentDay?.activities.findIndex((a) => a.id === activity.id) ?? -1;

  const colorPopover = {
    triggerRef: colorButtonRef,
    open: activePopup === 'color',
    onOpenChange(open: boolean) {
      setActivePopup((prev) => {
        if (open) return 'color';
        return prev === 'color' ? null : prev;
      });
    },
    content: (
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
      />
    ),
  } as const;

  const dayPopover = {
    triggerRef: dateButtonRef,
    open: activePopup === 'date' && availableDays.length > 0,
    onOpenChange(open: boolean) {
      setActivePopup((prev) => {
        if (open) return 'date';
        return prev === 'date' ? null : prev;
      });
    },
    content:
      availableDays.length > 0 ? (
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
        />
      ) : null,
  } as const;

  return {
    colorPopover,
    dayPopover,
  } as const;
}
