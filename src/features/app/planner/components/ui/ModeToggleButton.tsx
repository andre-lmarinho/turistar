'use client';

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useMotionValue, animate, type ValueAnimationTransition } from 'framer-motion';
import type { LucideIcon } from '@/shared/ui/icon';
import { List, Map, DollarSign } from '@/shared/ui/icon';
import { useElementMeasure } from '@/features/app/planner/hooks/ui/useElementMeasure';

type Mode = 'planner' | 'map' | 'budget';
const modes: Mode[] = ['planner', 'map', 'budget'];

const MODE_CONFIG: Record<Mode, { label: string; icon: LucideIcon }> = {
  planner: { label: 'Planner', icon: List },
  map: { label: 'Map', icon: Map },
  budget: { label: 'Budget', icon: DollarSign },
};

interface ModeToggleButtonProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeToggleButton({ value, onChange }: ModeToggleButtonProps) {
  const { ref: containerRef, rect: containerRect } = useElementMeasure<HTMLDivElement>({
    rect: true,
  });
  const highlightX = useMotionValue(0);
  const highlightW = useMotionValue(0);
  const isFirst = useRef(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (containerRect) setReady(true);
  }, [containerRect]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !containerRect) return;

    const btns = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    const idx = modes.indexOf(value);
    const btn = btns[idx];
    if (!btn) return;

    const { left: bLeft, width: bWidth } = btn.getBoundingClientRect();
    const newX = bLeft - containerRect.left;
    const newW = bWidth - 8;

    const spring: ValueAnimationTransition<number> = {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    };

    if (isFirst.current) {
      highlightX.set(newX);
      highlightW.set(newW);
      isFirst.current = false;
    } else {
      animate(highlightX, newX, spring);
      animate(highlightW, newW, spring);
    }
  }, [value, containerRect, highlightX, highlightW, containerRef]);

  return (
    <div className="inline-flex">
      <div
        ref={containerRef}
        role="group"
        aria-label="View mode selector"
        className="bg-background border-border relative flex min-w-[200px] overflow-hidden rounded-md border"
      >
        {ready && (
          <motion.div
            initial={false}
            style={{ x: highlightX, width: highlightW }}
            className="bg-primary absolute inset-1 rounded-sm"
          />
        )}

        {modes.map((mode) => {
          const { label, icon: Icon } = MODE_CONFIG[mode];
          const selected = mode === value;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              aria-pressed={selected}
              className={`relative z-10 h-10 flex-1 cursor-pointer px-2 text-sm font-medium transition-colors ${
                selected ? 'text-primary-foreground' : 'text-foreground hover:text-foreground'
              } `}
            >
              <div className="flex h-full w-full items-center justify-center gap-2 p-2">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
