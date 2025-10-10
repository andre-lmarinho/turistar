// src/shared/ui/modal/Modal.tsx
'use client';

import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { cn } from '@/shared/utils/cn';
import { usePopupDismiss } from '@/shared/hooks/ui/usePopupDismiss';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  withOverlay?: boolean;
  onClose?: () => void;
  closeOnEscape?: boolean;
  overlayClassName?: string;
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

  usePopupDismiss({
    popupRef: containerRef,
    triggerRef: undefined,
    onClose: onClose ?? (() => {}),
    isOpen: Boolean(open && onClose && closeOnEscape),
  });

  if (!open) return null;

  const content = (
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
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </FocusTrap>
  );

  const wrappedContent = withOverlay ? (
    <>
      <div className={cn('backdrop-overlay', overlayClassName)} onClick={onClose} />
      <div
        className={cn('fixed inset-0 z-50 flex items-center justify-center', wrapperClassName)}
        onClick={onClose}
      >
        {content}
      </div>
    </>
  ) : (
    content
  );

  return ReactDOM.createPortal(wrappedContent, document.body);
}
