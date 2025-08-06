// src/components/planner/catalog/CategoryFilterBar.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NavCircleButton } from '@/shared/ui';

/**
 * Horizontal scrollable pill list.
 * - Click toggles a category on/off.
 * - Dragging scrolls the list.
 * - Arrows scroll the list and auto-hide when at edges.
 */
export default function CategoryFilterBar({
  categories,
  active,
  onToggle,
}: {
  categories: string[];
  active: Set<string>;
  onToggle: (cat: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const updateScrollVisibility = () => {
    const container = containerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 4);

    const scrollRight = container.scrollWidth - container.clientWidth - container.scrollLeft;
    setCanScrollRight(scrollRight > 4);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(false);
    dragStartX.current = e.clientX;
    scrollStartX.current = container.scrollLeft;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 5) {
        setIsDragging(true);
        container.scrollLeft = scrollStartX.current - deltaX;
        updateScrollVisibility();
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setTimeout(() => {
        setIsDragging(false);
        updateScrollVisibility();
      }, 0);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const scrollBy = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const offset = direction === 'left' ? -150 : 150;
    container.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollVisibility, 200);
  };

  useEffect(() => {
    updateScrollVisibility();
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateScrollVisibility);
    return () => container.removeEventListener('scroll', updateScrollVisibility);
  }, []);

  return (
    <div className="relative flex items-center p-1">
      {/* Left scroll button */}
      {canScrollLeft && (
        <NavCircleButton
          direction="left"
          aria-label="Scroll left"
          onClick={() => scrollBy('left')}
          className="absolute top-1/2 left-1 z-10 -translate-y-1/2 shadow-md"
        />
      )}

      {/* Scrollable category list */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        className="scrollbar-hidden mx-8 flex gap-2 overflow-x-auto px-2 select-none"
      >
        {categories.map((cat) => {
          const isOn = active.has(cat);
          return (
            <button
              key={cat}
              onClick={() => {
                if (!isDragging) onToggle(cat);
              }}
              className={`cursor-pointer rounded-lg border px-3 py-1 text-sm whitespace-nowrap transition ${
                isOn
                  ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  : 'bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)]'
              } `}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <NavCircleButton
          direction="right"
          aria-label="Scroll right"
          onClick={() => scrollBy('right')}
          className="absolute top-1/2 right-1 z-10 -translate-y-1/2 shadow-md"
        />
      )}
    </div>
  );
}
