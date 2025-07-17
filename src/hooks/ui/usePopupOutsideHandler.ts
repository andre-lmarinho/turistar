// src/hooks/ui/usePopupOutsideHandler.ts

import { useEffect, RefObject } from 'react';

export function usePopupOutsideHandler({
  popupRef,
  triggerRef,
  onClose,
  isOpen = true,
}: {
  popupRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement>;
  onClose: () => void;
  isOpen?: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;

      const clickedOutside = popupRef.current && !popupRef.current.contains(target);
      const clickedTrigger = triggerRef?.current?.contains?.(target);

      if (clickedOutside && !clickedTrigger) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popupRef, triggerRef, onClose, isOpen]);
}
