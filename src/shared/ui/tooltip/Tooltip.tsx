// src/shared/ui/tooltip/Tooltip.tsx
'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/shared/utils/cn';

const DEFAULT_DELAY_DURATION = 150;
const DEFAULT_SIDE_OFFSET = 6;

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
  side?: TooltipPrimitive.TooltipContentProps['side'];
  align?: TooltipPrimitive.TooltipContentProps['align'];
  sideOffset?: number;
  delayDuration?: number;
}

export default function Tooltip({
  content,
  children,
  className,
  side = 'top',
  align = 'center',
  sideOffset = DEFAULT_SIDE_OFFSET,
  delayDuration = DEFAULT_DELAY_DURATION,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'z-50 select-none rounded shadow-md outline-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
            'pointer-events-auto w-max max-w-xs border border-border bg-background p-2 text-xs text-foreground',
            className
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
