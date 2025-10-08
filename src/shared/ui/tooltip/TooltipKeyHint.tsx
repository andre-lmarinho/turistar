// src/shared/ui/tooltip/TooltipKeyHint.tsx
'use client';

import React from 'react';

import Tooltip, { type TooltipProps } from './Tooltip';

interface KeyHintTooltipProps
  extends Omit<TooltipProps, 'content' | 'children'> {
  /** Tooltip text before the shortcut key label */
  content: React.ReactNode;
  /** Keyboard shortcut key */
  shortcut: string;
  /** @deprecated Use the `side` prop instead. */
  position?: 'top' | 'bottom';
  className?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export default function TooltipKeyHint({
  content,
  shortcut,
  position,
  side,
  className,
  children,
  ...props
}: KeyHintTooltipProps) {
  const label = shortcut.toUpperCase();
  const resolvedSide = side ?? position ?? 'top';

  return (
    <Tooltip
      {...props}
      side={resolvedSide}
      className={className}
      content={(
        <>
          {content}{' '}
          <kbd className="bg-background rounded px-1 py-0.5 text-xs font-medium text-[var(--foreground)]">
            {label}
          </kbd>
        </>
      )}
    >
      {children}
    </Tooltip>
  );
}
