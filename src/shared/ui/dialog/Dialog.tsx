'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';

import { cn } from '@/shared/utils/cn';

const overlayVariants = cva(
  'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out',
  {
    variants: {
      appearance: {
        default: '',
        transparent: 'bg-transparent backdrop-blur-0',
        subtle: 'bg-background/40 backdrop-blur',
      },
    },
    defaultVariants: {
      appearance: 'default',
    },
  }
);

const contentVariants = cva(
  'fixed z-50 grid w-full gap-4 bg-background p-6 shadow-xl duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-lg',
        lg: 'sm:max-w-2xl',
        xl: 'sm:max-w-4xl',
        full: 'sm:max-w-full',
      },
      position: {
        center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        top: 'left-1/2 top-10 -translate-x-1/2',
        inline: '',
      },
      scroll: {
        content: 'max-h-[90vh] overflow-y-auto',
        body: '',
      },
      radius: {
        md: 'rounded-lg',
        lg: 'rounded-xl',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
      scroll: 'content',
      radius: 'lg',
    },
  }
);

export type DialogProps = DialogPrimitive.DialogProps & {
  onClose?: () => void;
};

export function Dialog({ onClose, onOpenChange, ...props }: DialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose?.();
    }
    onOpenChange?.(nextOpen);
  };

  return <DialogPrimitive.Root {...props} onOpenChange={handleOpenChange} />;
}

export const DialogPortal = DialogPrimitive.Portal;

export interface DialogOverlayProps
  extends DialogPrimitive.DialogOverlayProps,
    VariantProps<typeof overlayVariants> {}

export const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(function DialogOverlay({ className, appearance, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(overlayVariants({ appearance }), className)}
      data-radix-dialog-overlay=""
      {...props}
    />
  );
});

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends DialogPrimitive.DialogContentProps,
    VariantProps<typeof contentVariants> {
  hideOverlay?: boolean;
  closeOnEscape?: boolean;
  overlayAppearance?: VariantProps<typeof overlayVariants>['appearance'];
  preventCloseOnOutsideClick?: boolean;
}

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  {
    className,
    children,
    size,
    position,
    scroll,
    radius,
    hideOverlay,
    closeOnEscape = true,
    overlayAppearance,
    preventCloseOnOutsideClick,
    onEscapeKeyDown,
    onPointerDownOutside,
    ...props
  },
  ref
) {
  return (
    <DialogPortal>
      {!hideOverlay ? <DialogOverlay appearance={overlayAppearance} /> : null}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(contentVariants({ size, position, scroll, radius }), className)}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) {
            event.preventDefault();
          }
          onEscapeKeyDown?.(event);
        }}
        onPointerDownOutside={(event) => {
          if (preventCloseOnOutsideClick) {
            event.preventDefault();
          }
          onPointerDownOutside?.(event);
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogClose = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  DialogPrimitive.DialogCloseProps
>(function DialogClose({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Close
      ref={ref}
      className={cn(
        'focus-visible:ring-primary inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
});

DialogClose.displayName = DialogPrimitive.Close.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);

export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
});

DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
});

DialogDescription.displayName = DialogPrimitive.Description.displayName;

export type DialogContentVariants = VariantProps<typeof contentVariants>;
export type DialogOverlayVariants = VariantProps<typeof overlayVariants>;
