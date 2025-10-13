import { RefObject, useEffect, useRef, useMemo } from 'react';
import { useKeyListener } from './useKeyListener';

interface UsePopupDismissParams {
  popupRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  isOpen?: boolean;
  /** Optional handler called when Escape is pressed. Defaults to `onClose`. */
  escapeHandler?: () => void;
}

/**
 * Handles closing a popup when the user presses Escape or clicks outside.
 * Optionally runs a custom escape handler before closing.
 * Restores focus to the element that triggered the popup when it closes.
 */
export function usePopupDismiss({
  popupRef,
  triggerRef,
  onClose,
  isOpen = true,
  escapeHandler,
}: UsePopupDismissParams) {
  const prevFocusedRef = useRef<HTMLElement | null>(null);

  const escape = useMemo(() => escapeHandler ?? onClose, [escapeHandler, onClose]);

  useKeyListener({ keys: { Escape: escape }, isActive: isOpen });

  useEffect(() => {
    if (!isOpen) return;

    prevFocusedRef.current = triggerRef?.current ?? (document.activeElement as HTMLElement) ?? null;

    function handleMouseDown(e: MouseEvent) {
      const path = e.composedPath();
      const popupEl = popupRef.current;
      const triggerEl = triggerRef?.current;
      const clickedInside = popupEl ? path.includes(popupEl) : false;
      const clickedTrigger = triggerEl ? path.includes(triggerEl) : false;

      if (!clickedInside && !clickedTrigger) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      prevFocusedRef.current?.focus?.();
    };
  }, [popupRef, triggerRef, onClose, isOpen]);
}
