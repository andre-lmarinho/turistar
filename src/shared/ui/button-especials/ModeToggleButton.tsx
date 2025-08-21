// src/shared/ui/button-especials/ModeToggleButton.tsx
'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion, useMotionValue, animate, type ValueAnimationTransition } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { List, Map, DollarSign } from 'lucide-react';
import { TooltipKeyHint } from '@/shared/ui';
import { KEY_BINDS } from '@/shared/constants';

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

export default function ModeToggleButton({ value, onChange }: ModeToggleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightX = useMotionValue(0);
  const highlightW = useMotionValue(0);
  const isFirst = useRef(true);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const positionIndicator = () => {
      const btns = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
      const idx = modes.indexOf(value);
      const btn = btns[idx];
      if (!btn) return;

      const { left: cLeft } = el.getBoundingClientRect();
      const { left: bLeft, width: bWidth } = btn.getBoundingClientRect();
      const newX = bLeft - cLeft;
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
    };

    positionIndicator();
    setReady(true);

    window.addEventListener('resize', positionIndicator);
    return () => window.removeEventListener('resize', positionIndicator);
  }, [value, highlightX, highlightW]);

  return (
    <div className="inline-flex">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="View mode selector"
        className="relative flex min-w-[200px] overflow-hidden rounded-[var(--radius)] bg-[var(--border)]"
      >
        {ready && (
          <motion.div
            initial={false}
            style={{ x: highlightX, width: highlightW }}
            className="absolute inset-1 rounded-[calc(var(--radius)-0.25rem)] bg-[var(--primary)]"
          />
        )}

        {modes.map((mode) => {
          const { label, icon: Icon } = MODE_CONFIG[mode];
          const selected = mode === value;

          const button = (
            <button
              key={mode}
              role="tab"
              type="button"
              onClick={() => onChange(mode)}
              aria-selected={selected}
              className={`relative z-10 flex-1 cursor-pointer px-2 py-1 text-sm font-medium transition-colors ${
                selected
                  ? 'text-[var(--primary-foreground)]'
                  : 'text-[var(--foreground)] hover:text-black'
              } `}
            >
              <div className="flex h-full w-full items-center justify-center gap-2 p-2">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </div>
            </button>
          );

          return (
            <TooltipKeyHint key={mode} shortcut={KEY_BINDS[mode]} content={label} position="bottom">
              {button}
            </TooltipKeyHint>
          );
        })}
      </div>
    </div>
  );
}
