// src/features/home/hooks/usePointerDragScroll.ts

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { scrollToChild } from '@/shared/utils/scrollToChild';

export type PointerDragHandlers = {
  onRelease?: (nearestIndex: number) => void;
  onDragStart?: () => void;
  onScrollPreview?: (nearestIndex: number) => void;
};

export function usePointerDragScroll(
  ref: RefObject<HTMLUListElement | null>,
  opts?: PointerDragHandlers
) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const startIdxRef = useRef(0);
  const overshootRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const nearestIndex = () => {
      const items = Array.from(el.children) as HTMLElement[];
      if (!items.length) return 0;
      const parentRect = el.getBoundingClientRect();
      const center = parentRect.left + parentRect.width / 2;
      let i = 0;
      let best = Infinity;
      items.forEach((it, idx) => {
        const rect = it.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const d = Math.abs(center - itemCenter);
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
      startIdxRef.current = nearestIndex();
      overshootRef.current = 0;
      el.style.transform = '';
      el.classList.add('is-dragging');
      opts?.onDragStart?.();
    };

    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const delta = e.clientX - startXRef.current;
      let next = startScrollRef.current - delta;
      const max = el.scrollWidth - el.clientWidth;
      if (next < 0 || next > max) {
        const overshoot = next < 0 ? next : next - max;
        // Move with the drag direction so the bounce feels natural.
        overshootRef.current = -overshoot * 0.35;
        el.style.transform = `translateX(${overshootRef.current}px)`;
        next = next < 0 ? 0 : max;
      } else {
        overshootRef.current = 0;
        el.style.transform = '';
      }
      el.scrollLeft = next;
      opts?.onScrollPreview?.(nearestIndex());
    };

    const up = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        el.releasePointerCapture?.(e.pointerId);
      } catch {}
      el.classList.remove('is-dragging');

      if (overshootRef.current !== 0) {
        el.style.transition = 'transform 200ms ease-out';
        el.style.transform = 'translateX(0)';
        const clear = () => {
          el.style.transition = '';
          el.removeEventListener('transitionend', clear);
        };
        el.addEventListener('transitionend', clear);
      }

      const delta = e.clientX - startXRef.current;
      const threshold = 40;
      const maxIdx = el.children.length - 1;
      let idx = nearestIndex();

      if (Math.abs(delta) > threshold) {
        const direction = delta < 0 ? 1 : -1;
        idx = Math.min(Math.max(startIdxRef.current + direction, 0), maxIdx);
      }

      scrollToChild(el, idx, { smooth: true, disableSnap: true, duration: 600 });
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
