// src/components/ui/Spinner.tsx
'use client';

import React from 'react';
import { cn } from '@/lib';

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block size-5 animate-spin rounded-full border-2 border-primary border-t-transparent',
        className
      )}
      aria-label="Loading"
    />
  );
}
