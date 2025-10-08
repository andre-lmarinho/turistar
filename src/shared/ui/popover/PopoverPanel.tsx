// src/shared/ui/popover/PopoverPanel.tsx
'use client';

import React, { useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import { usePopupDismiss } from '@/shared/hooks/ui/usePopupDismiss';
import { OverlayContainer } from '../overlay-container';

/** Popover panel style variants */
export const popoverPanelVariants = cva(
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

interface PopoverPanelProps
  extends React.ComponentProps<typeof OverlayContainer>,
    VariantProps<typeof popoverPanelVariants> {}

export default function PopoverPanel({
  open = true,
  withOverlay = false,
  triggerRef,
  onClose,
  size,
  className,
  overlayClassName,
  children,
  ...props
}: PopoverPanelProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  usePopupDismiss({ popupRef, triggerRef, onClose: onClose ?? (() => {}), isOpen: open });

  return (
    <OverlayContainer
      ref={popupRef}
      open={open}
      withOverlay={withOverlay}
      onClose={onClose}
      overlayClassName={overlayClassName}
      className={cn(popoverPanelVariants({ size }), className)}
      triggerRef={triggerRef}
      {...props}
    >
      {children}
    </OverlayContainer>
  );
}
