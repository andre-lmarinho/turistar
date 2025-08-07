// src/shared/hooks/ui/useInputWidth.ts
'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { measureTextWidth } from '@/shared/utils';

/**
 * Calculates the pixel width needed to display an input's value
 * using its computed font styles.
 */
export function useInputWidth(value: string) {
  const ref = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const style = window.getComputedStyle(el);
    const font = style.font;
    const paddingLeft = parseFloat(style.paddingLeft || '0');
    const paddingRight = parseFloat(style.paddingRight || '0');
    const borderLeft = parseFloat(style.borderLeftWidth || '0');
    const borderRight = parseFloat(style.borderRightWidth || '0');

    const textWidth = measureTextWidth(value || ' ', font);
    const newWidth = Math.ceil(textWidth + paddingLeft + paddingRight + borderLeft + borderRight);
    setWidth(newWidth);
  }, [value]);

  return { ref, width };
}
