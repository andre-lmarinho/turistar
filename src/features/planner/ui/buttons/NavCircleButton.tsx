'use client';

import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
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
      size="compact-icon"
      title={title}
      icon={icon}
      className={className}
      {...props}
    />
  );
}
