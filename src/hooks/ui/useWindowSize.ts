// src/hooks/ui/useWindowSize.ts

import { useState, useEffect, RefObject } from 'react';

/**
 * Hook that tracks the bounding client rect of a DOM element.
 * It updates the rect on window resize or when the element changes.
 */

export function useWindowSize<T extends HTMLElement = HTMLElement>(ref: RefObject<T | null>) {
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
    return () => {
      window.removeEventListener('resize', updateRect);
    };
  }, [ref]);

  return rect;
}
