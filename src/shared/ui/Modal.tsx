// src/shared/ui/Modal.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import OverlayContainer from './OverlayContainer';
import { cn } from '@/shared/utils/utils';

interface ModalProps extends React.ComponentProps<typeof OverlayContainer> {}

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
  if (!open) return null;

  return ReactDOM.createPortal(
    <OverlayContainer
      open={open}
      withOverlay={withOverlay}
      onClose={onClose}
      closeOnEscape={closeOnEscape}
      overlayClassName={overlayClassName}
      wrapperClassName={wrapperClassName}
      className={cn(
        'bg-background focus:ring-primary rounded-lg shadow-xl focus:ring-2 focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </OverlayContainer>,
    document.body
  );
}
