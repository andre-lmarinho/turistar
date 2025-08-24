// src/shared/hooks/ui/useElementMeasure.ts
'use client';

import { useRef, useState, useLayoutEffect, useEffect, RefObject, useCallback } from 'react';
import { measureTextWidth } from '@/shared/utils';

interface MeasureOptions<T extends HTMLElement> {
  /** Optional external ref. If not provided, an internal ref is used. */
  ref?: RefObject<T | null>;
  /** Track element width. */
  width?: boolean;
  /** Track element height. */
  height?: boolean;
  /** Track the full DOMRect. */
  rect?: boolean;
  /** Text value to measure width for (e.g. inputs). */
  text?: string;
}

interface MeasureResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  width?: number;
  height?: number;
  rect?: DOMRect | null;
}

function calculateTextWidth(el: HTMLElement, text: string) {
  const style = window.getComputedStyle(el);
  const font = style.font;
  const paddingLeft = parseFloat(style.paddingLeft || '0');
  const paddingRight = parseFloat(style.paddingRight || '0');
  const borderLeft = parseFloat(style.borderLeftWidth || '0');
  const borderRight = parseFloat(style.borderRightWidth || '0');
  const textWidth = measureTextWidth(text || ' ', font);
  return Math.ceil(textWidth + paddingLeft + paddingRight + borderLeft + borderRight);
}

export function useElementMeasure<T extends HTMLElement = HTMLElement>(
  options: MeasureOptions<T> = {}
): MeasureResult<T> {
  const { ref: externalRef, width, height, rect, text } = options;
  const internalRef = useRef<T | null>(null);
  const ref = externalRef ?? internalRef;

  const [measures, setMeasures] = useState<{
    width?: number;
    height?: number;
    rect?: DOMRect | null;
  }>({ rect: rect ? null : undefined });

  const updateMeasures = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const bounding = rect || height || (width && !text) ? el.getBoundingClientRect() : undefined;

    setMeasures((prev) => ({
      width: width
        ? text !== undefined
          ? calculateTextWidth(el, text)
          : bounding?.width
        : prev.width,
      height: height ? bounding?.height : prev.height,
      rect: rect ? (bounding ?? el.getBoundingClientRect()) : prev.rect,
    }));
  }, [ref, width, height, rect, text]);

  useLayoutEffect(() => {
    updateMeasures();
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(updateMeasures);
    observer.observe(el);

    if (rect) {
      window.addEventListener('scroll', updateMeasures, true);
    }

    return () => {
      observer.disconnect();
      if (rect) {
        window.removeEventListener('scroll', updateMeasures, true);
      }
    };
  }, [ref, updateMeasures, rect]);

  useEffect(() => {
    if (text !== undefined) {
      updateMeasures();
    }
  }, [text, updateMeasures]);

  return { ref, ...measures };
}
