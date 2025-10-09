'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/shared/utils/cn';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  const contentId = React.useId();

  const describedBy = [children.props['aria-describedby'], contentId]
    .filter(Boolean)
    .join(' ')
    .trim();

  const trigger = React.cloneElement(children, {
    'aria-describedby': describedBy || undefined,
    'aria-haspopup': 'true',
  });

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            id={contentId}
            side={position}
            align="center"
            sideOffset={6}
            className={cn(
              'text-background pointer-events-none z-50 rounded bg-[var(--foreground)] px-2 py-1 text-xs',
              className
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
