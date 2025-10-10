'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/shared/utils/cn';

type TooltipProps = {
  children: React.ReactElement;
  content: React.ReactNode;
  delayDuration?: number;
  position?: 'top' | 'bottom';
} & Omit<TooltipPrimitive.TooltipContentProps, 'children' | 'side'>;

export default function Tooltip({
  children,
  content,
  delayDuration = 100,
  position = 'top',
  align = 'center',
  sideOffset = 6,
  className,
  ...props
}: TooltipProps) {
  const Content = (
    <TooltipPrimitive.Content
      {...props}
      side={position}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'text-background pointer-events-none z-50 rounded bg-[var(--foreground)] px-2 py-1 text-xs',
        className
      )}
    >
      {content}
    </TooltipPrimitive.Content>
  );

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>{Content}</TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
