// src/components/ui/popups/Popup.tsx
'use client';

import React, { useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
import { usePopupOutsideHandler, useEscapeKey } from '@/hooks';

/** Popup style variants */
export const popupVariants = cva(
  'bg-background focus:ring-primary rounded-lg shadow-xl focus:ring-2 focus:outline-none',
  {
    variants: {
      size: {
        sm: 'w-[200px]',
        md: 'w-72',
        lg: 'w-96',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface PopupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof popupVariants> {
  /**
   * Control visibility and FocusTrap activation.
   * If undefined the popup is always rendered.
   */
  open?: boolean;
  /** Overlay element shown behind the popup */
  withOverlay?: boolean;
  /** Ref to trigger element for outside click handling */
  triggerRef?: React.RefObject<HTMLElement>;
  /** Called when user requests to close the popup */
  onClose?: () => void;
  overlayClassName?: string;
}

export default function Popup({
  open = true,
  withOverlay = false,
  triggerRef,
  onClose,
  size,
  className,
  overlayClassName,
  children,
  ...props
}: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  usePopupOutsideHandler({ popupRef, triggerRef, onClose: onClose ?? (() => {}), isOpen: open });
  useEscapeKey({ onClose: onClose ?? (() => {}), isActive: open, triggerRef });

  if (!open) return null;

  const popup = (
    <FocusTrap
      active={open}
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        escapeDeactivates: false,
        initialFocus: false,
        fallbackFocus: () => popupRef.current ?? document.body,
        tabbableOptions: { displayCheck: 'none' },
      }}
    >
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(popupVariants({ size }), className)}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </FocusTrap>
  );

  return withOverlay ? (
    <div
      className={cn('backdrop-overlay flex items-center justify-center', overlayClassName)}
      onClick={onClose}
    >
      {popup}
    </div>
  ) : (
    popup
  );
}
