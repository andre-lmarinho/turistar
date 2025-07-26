// src/components/TooltipKeyHint.tsx
'use client';

import React from 'react';
import { Tooltip } from '@/components/ui';

interface KeyHintTooltipProps {
  /** Tooltip text before the shortcut key label */
  content: React.ReactNode;
  /** Keyboard shortcut key */
  shortcut: string;
  /** Tooltip display position */
  position?: 'top' | 'bottom';
  className?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export default function TooltipKeyHint({
  content,
  shortcut,
  position = 'top',
  className,
  children,
}: KeyHintTooltipProps) {
  const label = shortcut.toUpperCase();

  return (
    <Tooltip
      content={
        <>
          {content}{' '}
          <kbd className="bg-background rounded px-1 py-0.5 text-xs font-medium text-gray-800">
            {label}
          </kbd>
        </>
      }
      position={position}
      className={className}
    >
      {children}
    </Tooltip>
  );
}
