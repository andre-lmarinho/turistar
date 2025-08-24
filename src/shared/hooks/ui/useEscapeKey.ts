// src/shared/hooks/ui/useEscapeKey.ts
'use client';

import { useEffect, useRef, RefObject, useMemo } from 'react';
import { useKeyListener } from './useKeyListener';

/**
 * Attaches a keydown listener for the Escape key while the popup is open.
 * When triggered, calls onClose and restores focus to the element that
 * initially opened the popup (provided via triggerRef or taken from the
 * currently focused element).
 */
export function useEscapeKey({
  onClose,
  isActive = true,
  triggerRef,
}: {
  onClose: () => void;
  isActive?: boolean;
  triggerRef?: RefObject<HTMLElement>;
}) {
  const prevFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    prevFocusedRef.current =
      (triggerRef?.current ?? (document.activeElement as HTMLElement)) || null;

    return () => {
      prevFocusedRef.current?.focus?.();
    };
  }, [isActive, triggerRef]);

  const handlers = useMemo(
    () => ({
      Escape: onClose,
    }),
    [onClose]
  );

  useKeyListener({ keys: handlers, isActive });
}
