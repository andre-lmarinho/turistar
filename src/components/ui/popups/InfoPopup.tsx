// src/components/ui/popups/InfoPopup.tsx
'use client';

import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components';

interface InfoPopupProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

export default function InfoPopup({ content, children }: InfoPopupProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-max max-w-xs p-2 text-xs rounded-md border bg-background shadow-md"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
