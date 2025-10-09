'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

const modalOverlayVariants = cva(
  'bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm',
  {
    variants: {
      blur: {
        none: 'backdrop-blur-0',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
      },
    },
    defaultVariants: {
      blur: 'sm',
    },
  }
);

const modalContentVariants = cva(
  'bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 fixed left-1/2 top-1/2 z-50 grid w-full gap-4 rounded-lg border p-6 shadow-xl outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%]',
  {
    variants: {
      size: {
        sm: 'sm:max-w-md',
        md: 'sm:max-w-lg',
        lg: 'sm:max-w-2xl',
        xl: 'sm:max-w-4xl',
        full: 'sm:max-w-[95vw]',
      },
      position: {
        center: 'translate-x-[-50%] translate-y-[-50%]',
        top: 'translate-x-[-50%] sm:translate-y-0 sm:top-[10%]',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
    },
  }
);

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof modalOverlayVariants>
>(({ className, blur, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="modal-overlay"
    className={cn(modalOverlayVariants({ blur }), className)}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof modalContentVariants> & {
      showOverlay?: boolean;
      overlayProps?: React.ComponentPropsWithoutRef<typeof ModalOverlay>;
    }
>(({ className, size, position, children, showOverlay = true, overlayProps, ...props }, ref) => (
  <DialogPrimitive.Portal>
    {showOverlay ? <ModalOverlay {...overlayProps} /> : null}
    <DialogPrimitive.Content
      ref={ref}
      data-slot="modal-content"
      className={cn(modalContentVariants({ size, position }), className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
ModalContent.displayName = DialogPrimitive.Content.displayName;

export type ModalOverlayVariants = VariantProps<typeof modalOverlayVariants>;
export type ModalContentVariants = VariantProps<typeof modalContentVariants>;

export { Modal, ModalTrigger, ModalContent, ModalOverlay, ModalClose };
