// src/shared/hooks/ui/usePointerDragScroll.ts

import { useEffect, useRef } from 'react';
import { scrollToChild } from '@/shared/utils';

export function usePointerDragScroll(
  ref: React.RefObject<HTMLUListElement | null>,
  opts?: {
    onRelease?: (nearestIndex: number) => void;
    onDragStart?: () => void;
    onScrollPreview?: (nearestIndex: number) => void;
  }
) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const nearestIndex = () => {
      const items = Array.from(el.children) as HTMLElement[];
      if (!items.length) return 0;
      const center = el.scrollLeft + el.clientWidth / 2;
      let i = 0;
      let best = Infinity;
      items.forEach((it, idx) => {
        const c = it.offsetLeft + it.offsetWidth / 2;
        const d = Math.abs(center - c);
        if (d < best) {
          best = d;
          i = idx;
        }
      });
      return i;
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      draggingRef.current = true;
      el.setPointerCapture?.(e.pointerId);
      startXRef.current = e.clientX;
      startScrollRef.current = el.scrollLeft;
      el.classList.add('is-dragging');
      opts?.onDragStart?.();
    };

    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      el.scrollLeft = startScrollRef.current - (e.clientX - startXRef.current);
      opts?.onScrollPreview?.(nearestIndex());
    };

    const up = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        el.releasePointerCapture?.(e.pointerId);
      } catch {}
      el.classList.remove('is-dragging');

      const idx = nearestIndex();
      scrollToChild(el, idx, { smooth: true, disableSnap: true });
      opts?.onRelease?.(idx);
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [ref, opts]);
}
