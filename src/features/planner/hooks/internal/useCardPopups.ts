// src/features/planner/hooks/internal/useCardPopups.ts
'use client';

import { useState } from 'react';
import { useFlexibleRef } from '@/shared/hooks/ui/useFlexibleRef';

/**
 * Manages state for card popups such as the color picker and date picker.
 * Provides trigger refs and handlers to toggle these popups.
 */

export type CardPopupType = 'color' | 'date' | null;

export function useCardPopups() {
  const colorButtonRef = useFlexibleRef();
  const dateButtonRef = useFlexibleRef();

  const [activePopup, setActivePopup] = useState<CardPopupType>(null);

  return {
    colorButtonRef,
    dateButtonRef,
    activePopup,
    setActivePopup,
  } as const;
}
