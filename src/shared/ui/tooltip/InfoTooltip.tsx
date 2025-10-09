'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/shared/utils/cn';

interface InfoTooltipProps extends Pick<React.AriaAttributes, 'aria-hidden'> {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  className?: string;
}

export default function InfoTooltip({ content, children, className, 'aria-hidden': ariaHidden }: InfoTooltipProps) {
  const contentId = React.useId();

  const describedBy = [children.props['aria-describedby'], contentId]
    .filter(Boolean)
    .join(' ')
    .trim();

  const trigger = React.cloneElement(children, {
    'aria-describedby': describedBy || undefined,
    'aria-haspopup': 'true',
    'aria-hidden': ariaHidden ?? children.props['aria-hidden'],
  });

  return (
    <TooltipPrimitive.Provider delayDuration={150} skipDelayDuration={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            id={contentId}
            role="tooltip"
            side="top"
            align="center"
            sideOffset={6}
            className={cn(
              'bg-background w-max max-w-xs rounded-md border p-2 text-xs text-[var(--foreground)] shadow-md',
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
