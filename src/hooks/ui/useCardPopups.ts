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

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  function handleColorButtonClick() {
    setIsColorPickerOpen((prev) => !prev);
    setIsDatePickerOpen(false);
  }

  function handleDateButtonClick() {
    setIsDatePickerOpen((prev) => !prev);
    setIsColorPickerOpen(false);
  }

  return {
    colorButtonRef,
    dateButtonRef,
    isColorPickerOpen,
    setIsColorPickerOpen,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleColorButtonClick,
    handleDateButtonClick,
  } as const;
}
