// src/components/ui/button-especials/ModeToggleButton.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, animate, type ValueAnimationTransition } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { List, DollarSign, Map } from 'lucide-react';

type Mode = 'planner' | 'budget' | 'map';
const modes: Mode[] = ['planner', 'budget', 'map'];

const MODE_CONFIG: Record<Mode, { label: string; icon: LucideIcon }> = {
  planner: { label: 'Planner', icon: List },
  budget: { label: 'Budget', icon: DollarSign },
  map: { label: 'Map', icon: Map },
};

interface ModeSelectorProps {
  value: Mode;
  onChange: (v: Mode) => void;
}

export default function ModeToggleButton({ value, onChange }: ModeSelectorProps) {
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
        aria-label="Mode selector"
        className="relative flex bg-[var(--border)] rounded-[var(--radius)] overflow-hidden min-w-[200px]"
      >
        <motion.div
          style={{ x, width }}
          className="absolute inset-1 bg-[var(--accent)] rounded-[calc(var(--radius)-0.25rem)]"
        />

        {modes.map((mode) => {
          const Icon = MODE_CONFIG[mode].icon;
          const label = MODE_CONFIG[mode].label;

          return (
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
              <div className="flex items-center justify-center gap-2 p-2 w-full h-full">
                <Icon aria-hidden="true" className="w-4 h-4" />
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
