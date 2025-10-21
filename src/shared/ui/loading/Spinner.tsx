'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'border-primary inline-block size-5 animate-spin rounded-full border-2 border-t-transparent',
        className
      )}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    />
  );
}
