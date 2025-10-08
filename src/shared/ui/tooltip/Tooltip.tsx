// src/shared/ui/tooltip/Tooltip.tsx
'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/shared/utils/cn';

const DEFAULT_DELAY_DURATION = 150;
const DEFAULT_SIDE_OFFSET = 6;

const toneClasses = {
  default:
    'pointer-events-none bg-[var(--foreground)] px-2 py-1 text-[10px] font-medium text-background',
  info: 'pointer-events-auto w-max max-w-xs border bg-background p-2 text-xs',
};

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
  side?: TooltipPrimitive.TooltipContentProps['side'];
  align?: TooltipPrimitive.TooltipContentProps['align'];
  sideOffset?: number;
  delayDuration?: number;
  tone?: keyof typeof toneClasses;
}

export default function Tooltip({
  content,
  children,
  className,
  side = 'top',
  align = 'center',
  sideOffset = DEFAULT_SIDE_OFFSET,
  delayDuration = DEFAULT_DELAY_DURATION,
  tone = 'default',
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
            toneClasses[tone],
            className
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
