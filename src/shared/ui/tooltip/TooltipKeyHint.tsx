// src/shared/ui/tooltip/TooltipKeyHint.tsx
'use client';

import React from 'react';
import Tooltip from './Tooltip';

interface KeyHintTooltipProps {
  /** Tooltip text before the shortcut key label */
  content: React.ReactNode;
  /** Keyboard shortcut key */
  shortcut: string;
  /** Tooltip display side */
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export default function TooltipKeyHint({
  content,
  shortcut,
  side = 'top',
  className,
  children,
}: KeyHintTooltipProps) {
  const label = shortcut.toUpperCase();

  return (
    <Tooltip
      content={
        <>
          {content}{' '}
          <kbd className="bg-background rounded px-1 py-0.5 text-xs font-medium text-[var(--foreground)]">
            {label}
          </kbd>
        </>
      }
      side={side}
      className={className}
    >
      {children}
    </Tooltip>
  );
}
