// src/hooks/ui/useCardPopups.ts
'use client';

import { useState } from 'react';
import { useFlexibleRef } from './useFlexibleRef';

/**
 * Manages state for card popups such as the color picker and date picker.
 * Provides trigger refs and handlers to toggle these popups.
 */

export function useCardPopups() {
  const colorButtonRef = useFlexibleRef();
  const dateButtonRef = useFlexibleRef();
  const positionButtonRef = useFlexibleRef();

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPositionPickerOpen, setIsPositionPickerOpen] = useState(false);

  function handleColorButtonClick() {
    setIsColorPickerOpen((prev) => !prev);
    setIsDatePickerOpen(false);
    setIsPositionPickerOpen(false);
  }

  function handleDateButtonClick() {
    setIsDatePickerOpen((prev) => !prev);
    setIsColorPickerOpen(false);
    setIsPositionPickerOpen(false);
  }

  function handlePositionButtonClick() {
    setIsPositionPickerOpen((prev) => !prev);
    setIsColorPickerOpen(false);
    setIsDatePickerOpen(false);
  }

  return {
    colorButtonRef,
    dateButtonRef,
    positionButtonRef,
    isColorPickerOpen,
    setIsColorPickerOpen,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isPositionPickerOpen,
    setIsPositionPickerOpen,
    handleColorButtonClick,
    handleDateButtonClick,
    handlePositionButtonClick,
  } as const;
}
