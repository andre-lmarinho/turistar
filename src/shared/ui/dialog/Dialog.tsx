// src/shared/ui/dialog/Dialog.tsx
'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/shared/utils/cn';

interface DialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  open?: boolean;
  withOverlay?: boolean;
  onClose?: () => void;
  closeOnEscape?: boolean;
  overlayClassName?: string;
  wrapperClassName?: string;
}

export default function Dialog({
  open = true,
  withOverlay = true,
  onClose,
  closeOnEscape = true,
  overlayClassName,
  wrapperClassName,
  className,
  children,
  ...props
}: DialogProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose?.();
        }
      }}
    >
      <DialogPrimitive.Portal>
        {withOverlay ? (
          <DialogPrimitive.Overlay
            className={cn('backdrop-overlay', overlayClassName)}
            data-testid="dialog-overlay"
          />
        ) : null}
        <div className={cn('fixed inset-0 z-50 flex items-center justify-center', wrapperClassName)}>
          <DialogPrimitive.Content
            className={cn(
              'bg-background focus:ring-primary rounded-lg shadow-xl focus:outline-none focus:ring-2',
              className
            )}
            onEscapeKeyDown={(event) => {
              if (!closeOnEscape) {
                event.preventDefault();
              }
            }}
            {...props}
          >
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
