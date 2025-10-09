'use client';

import React from 'react';
import Tooltip from './Tooltip';

interface KeyHintTooltipProps {
  content: React.ReactNode;
  shortcut: string;
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
          <kbd className="bg-background rounded px-1 py-0.5 text-xs font-medium text-[var(--foreground)]">
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
