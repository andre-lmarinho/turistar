// src/components/ui/button-especials/ModeToggleButton.tsx
'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion, useMotionValue, animate, type ValueAnimationTransition } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { List, Map, DollarSign } from 'lucide-react';
import { TooltipKeyHint } from '@/components';
import { KEY_BINDS } from '@/constants';

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
        className="relative flex bg-[var(--border)] rounded-[var(--radius)] overflow-hidden min-w-[200px]"
      >
        {ready && (
          <motion.div
            initial={false}
            style={{ x: highlightX, width: highlightW }}
            className="absolute inset-1 bg-[var(--accent)] rounded-[calc(var(--radius)-0.25rem)]"
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
              className={`
                flex-1 px-2 py-1 cursor-pointer relative z-10 text-sm font-medium transition-colors
                ${
                  selected
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
