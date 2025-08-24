// src/shared/hooks/ui/useElementRect.ts

import { useState, useEffect, RefObject } from 'react';

/**
 * Hook that tracks the bounding client rect of a DOM element.
 * It updates the rect on window resize or when the element changes.
 */

export function useElementRect<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  listenScroll = false
) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const updateRect = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };

    updateRect();

    window.addEventListener('resize', updateRect);
    if (listenScroll) {
      window.addEventListener('scroll', updateRect, true);
    }
    return () => {
      window.removeEventListener('resize', updateRect);
      if (listenScroll) {
        window.removeEventListener('scroll', updateRect, true);
      }
    };
  }, [ref, listenScroll]);

  return rect;
}
