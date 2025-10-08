'use client';

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { motion, useMotionValue, animate, type ValueAnimationTransition } from 'framer-motion';
import TooltipKeyHint from '@/shared/ui/TooltipKeyHint';
import { KEY_BINDS } from '@/features/planner/domain/constants/keyBinds';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
import { Button } from '@/shared/ui/button';
import { lucideIcons, type LucideIconName } from '@/shared/ui/icon';

type Mode = 'planner' | 'map' | 'budget';
const modes: Mode[] = ['planner', 'map', 'budget'];

const MODE_CONFIG: Record<Mode, { label: string; icon: LucideIconName }> = {
  planner: { label: 'Planner', icon: 'list' },
  map: { label: 'Map', icon: 'map' },
  budget: { label: 'Budget', icon: 'dollar-sign' },
};

interface ModeToggleButtonProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggleButton({ value, onChange }: ModeToggleButtonProps) {
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
          const { label, icon } = MODE_CONFIG[mode];
          const Icon = lucideIcons[icon];
          const selected = mode === value;

          const button = (
            <Button
              key={mode}
              role="tab"
              type="button"
              variant="plannerModeToggle"
              onClick={() => onChange(mode)}
              aria-selected={selected}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </Button>
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
