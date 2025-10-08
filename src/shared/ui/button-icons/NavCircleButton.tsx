// src/shared/ui/button-icons/NavCircleButton.tsx
'use client';

import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';

interface NavCircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: 'left' | 'right';
}

export default function NavCircleButton({
  direction = 'left',
  className,
  title: providedTitle,
  ...props
}: NavCircleButtonProps) {
  const icon = direction === 'left' ? 'chevron-left' : 'chevron-right';
  const ariaLabel = props['aria-label'] as string | undefined;
  const title =
    providedTitle ?? ariaLabel ?? (direction === 'left' ? 'Previous step' : 'Next step');

  return (
    <Button
      type="button"
      variant="icon"
      size="icon"
      title={title}
      className={cn('size-7 rounded-full p-0', className)}
      icon={icon}
      iconProps={{ className: 'size-[18px]' }}
      {...props}
    />
  );
}
