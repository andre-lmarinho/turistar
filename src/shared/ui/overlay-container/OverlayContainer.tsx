'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { cn } from '@/shared/utils/cn';
import { usePopupDismiss } from '@/shared/hooks/ui/usePopupDismiss';

interface OverlayContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Control visibility and FocusTrap activation */
  open?: boolean;
  /** Render a backdrop element behind the content */
  withOverlay?: boolean;
  /** Called when the user requests to close the overlay */
  onClose?: () => void;
  /** Close when the Escape key is pressed */
  closeOnEscape?: boolean;
  /** Ref to the element that triggered the overlay */
  triggerRef?: React.RefObject<HTMLElement>;
  /** Additional classes for the overlay element */
  overlayClassName?: string;
  /** Classes for the wrapper that centers the content */
  wrapperClassName?: string;
}

const OverlayContainer = forwardRef<HTMLDivElement, OverlayContainerProps>(
  (
    {
      open = true,
      withOverlay = true,
      onClose,
      closeOnEscape = true,
      overlayClassName,
      wrapperClassName,
      className,
      triggerRef,
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current!);

    usePopupDismiss({
      popupRef: containerRef,
      triggerRef,
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
          className={cn(className)}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </FocusTrap>
    );

    return withOverlay ? (
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
  }
);

OverlayContainer.displayName = 'OverlayContainer';

export default OverlayContainer;
