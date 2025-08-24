// src/shared/hooks/ui/usePopupDismiss.ts

import { RefObject, useEffect, useRef } from 'react';

interface UsePopupDismissParams {
  popupRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  isOpen?: boolean;
}

/**
 * Handles closing a popup when the user presses Escape or clicks outside.
 * Restores focus to the element that triggered the popup when it closes.
 */
export function usePopupDismiss({
  popupRef,
  triggerRef,
  onClose,
  isOpen = true,
}: UsePopupDismissParams) {
  const prevFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    prevFocusedRef.current = triggerRef?.current ?? (document.activeElement as HTMLElement) ?? null;

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const clickedOutside = popupRef.current && !popupRef.current.contains(target);
      const clickedTrigger = triggerRef?.current?.contains?.(target);

      if (clickedOutside && !clickedTrigger) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      prevFocusedRef.current?.focus?.();
    };
  }, [popupRef, triggerRef, onClose, isOpen]);
}
