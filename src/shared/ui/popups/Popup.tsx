// src/shared/ui/popups/Popup.tsx
'use client';

import React, { useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { usePopupDismiss } from '@/shared/hooks/ui/usePopupDismiss';
import OverlayContainer from '../OverlayContainer';

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
  extends React.ComponentProps<typeof OverlayContainer>,
    VariantProps<typeof popupVariants> {}

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

  usePopupDismiss({ popupRef, triggerRef, onClose: onClose ?? (() => {}), isOpen: open });

  return (
    <OverlayContainer
      ref={popupRef}
      open={open}
      withOverlay={withOverlay}
      onClose={onClose}
      overlayClassName={overlayClassName}
      className={cn(popupVariants({ size }), className)}
      triggerRef={triggerRef}
      {...props}
    >
      {children}
    </OverlayContainer>
  );
}
