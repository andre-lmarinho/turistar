'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { X } from '@/shared/ui/icon';
import { cn } from '@/shared/utils/cn';

const Popover = PopoverPrimitive.Root;

type PopoverTriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

const PopoverTriggerButton = React.forwardRef<HTMLButtonElement, PopoverTriggerButtonProps>(
  function PopoverTriggerButton({ className, type = 'button', children, ...props }, ref) {
    return (
      <PopoverPrimitive.Trigger asChild>
        <button ref={ref} type={type} className={className} {...props}>
          {children}
        </button>
      </PopoverPrimitive.Trigger>
    );
  }
);

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = 'center', sideOffset = 4, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-background text-popover-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 rounded-md border p-4 shadow-md outline-hidden',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

PopoverContent.displayName = 'PopoverContent';

type PopoverHeaderProps = {
  title: string;
  titleId?: string;
  onClose?: () => void;
  className?: string;
};

function PopoverHeader({ title, titleId, onClose, className }: PopoverHeaderProps) {
  return (
    <div className={cn('relative flex items-center justify-end p-2', className)}>
      <h2 id={titleId} className="absolute inset-0 p-3 text-center text-sm font-medium">
        {title}
      </h2>
      <PopoverPrimitive.Close
        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground z-10 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-2 transition-colors"
        aria-label="Close"
        onClick={onClose}
      >
        <X className="size-4" aria-hidden="true" />
      </PopoverPrimitive.Close>
    </div>
  );
}

export { Popover, PopoverTriggerButton, PopoverContent, PopoverHeader };
