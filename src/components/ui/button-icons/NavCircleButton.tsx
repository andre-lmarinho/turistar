// src/components/ui/button-icons/NavCircleButton.tsx
'use client';

import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavCircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: 'left' | 'right';
}

export default function NavCircleButton({
  direction = 'left',
  className,
  ...props
}: NavCircleButtonProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      {...props}
      className={cn(
        'p-1 rounded-full cursor-pointer bg-background border border-bg-gray-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
