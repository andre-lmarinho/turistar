// src/components/ui/button-especials/ModeSelector.tsx

'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, animate, type ValueAnimationTransition } from 'framer-motion';

type Mode = 'planner' | 'budget';
const modes: Mode[] = ['planner', 'budget'];

interface ModeSelectorProps {
  value: Mode;
  onChange: (v: Mode) => void;
}

export function ModeToggleButton({ value, onChange }: ModeSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const width = useMotionValue(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    const idx = modes.indexOf(value);
    const btn = buttons[idx];
    if (!btn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const newX = btnRect.left - containerRect.left;
    const newWidth = btn.offsetWidth - 8;

    const springConfig: ValueAnimationTransition<number> = {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    };

    if (isFirstRender.current) {
      x.set(newX);
      width.set(newWidth);
      isFirstRender.current = false;
    } else {
      animate(x, newX, springConfig);
      animate(width, newWidth, springConfig);
    }
  }, [value, x, width]);

  return (
    <div className="inline-flex">
      <div
        ref={containerRef}
        role="group"
        className="relative flex bg-[var(--border)] rounded-[var(--radius)] overflow-hidden min-w-[200px]"
      >
        <motion.div
          style={{ x, width }}
          className="absolute inset-1 bg-[var(--accent)] rounded-[calc(var(--radius)-0.25rem)]"
        />

        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={value === mode}
            className={`
          flex-1 relative z-10 text-sm cursor-pointer font-medium transition-colors
          ${
            value === mode
              ? 'text-[var(--accent-foreground)]'
              : 'text-[var(--foreground)] hover:text-[var(--accent)]'
          }
        `}
          >
            <div className="flex items-center justify-center p-2 w-full h-full">
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
