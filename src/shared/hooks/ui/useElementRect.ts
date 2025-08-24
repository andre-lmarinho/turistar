// src/shared/hooks/ui/useElementRect.ts

import { useState, useEffect, RefObject } from 'react';

/**
 * Hook that tracks the bounding client rect of a DOM element.
 * It updates the rect on element resize and scroll to track position.
 */

export function useElementRect<T extends HTMLElement = HTMLElement>(ref: RefObject<T | null>) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateRect = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };

    updateRect();

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(element);

    window.addEventListener('scroll', updateRect, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [ref]);

  return rect;
}
