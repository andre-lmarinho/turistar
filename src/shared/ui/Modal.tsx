// src/shared/ui/Modal.tsx
'use client';

import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { useEscapeKey } from '@/shared/hooks/ui/useEscapeKey';
import { cn } from '@/shared/utils';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Control visibility and FocusTrap activation */
  open?: boolean;
  /** Render a backdrop element behind the modal */
  withOverlay?: boolean;
  /** Called when the user requests to close the modal */
  onClose?: () => void;
  /** Close the modal when the Escape key is pressed */
  closeOnEscape?: boolean;
  /** Additional classes for the backdrop element */
  overlayClassName?: string;
  /** Classes for the wrapper that centers the modal */
  wrapperClassName?: string;
}

export default function Modal({
  open = true,
  withOverlay = true,
  onClose,
  closeOnEscape = true,
  overlayClassName,
  wrapperClassName,
  className,
  children,
  ...props
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEscapeKey({
    onClose: onClose ?? (() => {}),
    isActive: Boolean(open && onClose && closeOnEscape),
  });

  if (!open) return null;

  const dialog = (
    <FocusTrap
      active={open}
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        escapeDeactivates: false,
        initialFocus: false,
        fallbackFocus: () => containerRef.current ?? document.body,
        tabbableOptions: { displayCheck: 'none' },
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'bg-background focus:ring-primary rounded-lg shadow-xl focus:ring-2 focus:outline-none',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </FocusTrap>
  );

  return ReactDOM.createPortal(
    <>
      {withOverlay && (
        <div className={cn('backdrop-overlay', overlayClassName)} onClick={onClose} />
      )}
      <div
        className={cn('fixed inset-0 z-50 flex items-center justify-center', wrapperClassName)}
        onClick={onClose}
      >
        {dialog}
      </div>
    </>,
    document.body
  );
}
