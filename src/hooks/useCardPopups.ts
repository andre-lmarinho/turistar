// src/hooks/useCardPopups.ts
'use client';

import { useState } from 'react';
import { useFlexibleRef } from './useFlexibleRef';

/**
 * Manages state for card popups such as the color picker and date picker.
 * Provides trigger refs and handlers to toggle these popups.
 */

export type CardPopupType = 'color' | 'date' | 'position' | null;

export function useCardPopups() {
  const colorButtonRef = useFlexibleRef();
  const dateButtonRef = useFlexibleRef();
  const positionButtonRef = useFlexibleRef();

  const [activePopup, setActivePopup] = useState<CardPopupType>(null);

  function handleColorButtonClick() {
    setActivePopup((prev) => (prev === 'color' ? null : 'color'));
  }

  function handleDateButtonClick() {
    setActivePopup((prev) => (prev === 'date' ? null : 'date'));
  }

  function handlePositionButtonClick() {
    setActivePopup((prev) => (prev === 'position' ? null : 'position'));
  }

  return {
    colorButtonRef,
    dateButtonRef,
    positionButtonRef,
    activePopup,
    setActivePopup,
    handleColorButtonClick,
    handleDateButtonClick,
    handlePositionButtonClick,
  } as const;
}
