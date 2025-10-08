// src/shared/ui/modal/Modal.tsx
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

const modalContentVariants = cva(
  'bg-background focus-visible:ring-primary border-border relative z-50 grid w-full gap-4 rounded-lg border p-6 shadow-xl outline-hidden focus-visible:ring-2',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

function Modal({ modal = true, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root modal={modal} {...props} />;
}

const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function ModalOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="modal-overlay"
      className={cn(
        'backdrop-overlay data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
});

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  overlayProps?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(function ModalContent({ className, children, size, overlayProps, ...props }, ref) {
  const { 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy, ...restProps } = props;

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Close asChild>
        <ModalOverlay {...overlayProps} />
      </DialogPrimitive.Close>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 focus:outline-none',
          modalContentVariants({ size }),
          className
        )}
        aria-modal="true"
        aria-describedby={ariaDescribedBy ?? undefined}
        aria-labelledby={ariaLabelledBy}
        {...restProps}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

ModalContent.displayName = 'ModalContent';

export { Modal, ModalTrigger, ModalContent, ModalOverlay, ModalClose };

export type ModalRootProps = React.ComponentProps<typeof Modal>;
export type ModalTriggerProps = React.ComponentPropsWithoutRef<typeof ModalTrigger>;
export type ModalContentComponentProps = ModalContentProps;
export type ModalOverlayProps = React.ComponentPropsWithoutRef<typeof ModalOverlay>;
export type ModalCloseProps = React.ComponentPropsWithoutRef<typeof ModalClose>;
