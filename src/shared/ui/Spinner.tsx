// src/components/ui/Spinner.tsx
'use client';

import React from 'react';
import { cn } from '@/shared/lib';

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'border-primary inline-block size-5 animate-spin rounded-full border-2 border-t-transparent',
        className
      )}
      aria-label="Loading"
    />
  );
}
