'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';

type GalleryGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function GalleryGrid({ children, className }: GalleryGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}
