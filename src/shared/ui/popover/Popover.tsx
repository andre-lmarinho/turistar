// src/shared/ui/popover/Popover.tsx
'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

const popoverContentVariants = cva(
  [
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    'z-50 origin-(--radix-popover-content-transform-origin) rounded-md outline-hidden',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-[200px]',
        md: 'w-72',
        lg: 'w-96',
        auto: '',
      },
      tone: {
        default: 'bg-background text-popover-foreground border border-border/60 p-4 shadow-md',
        plain: 'bg-transparent text-popover-foreground border-none p-0 shadow-none',
      },
    },
    defaultVariants: {
      size: 'md',
      tone: 'default',
    },
  }
);

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content> &
  VariantProps<typeof popoverContentVariants>;

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  size,
  tone,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(popoverContentVariants({ size, tone }), className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent, popoverContentVariants };
