// src/components/ui/popups/InfoPopup.tsx
'use client';

import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui';

interface InfoPopupProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

export default function InfoPopup({ content, children }: InfoPopupProps) {
  const [open, setOpen] = React.useState(false);
  const contentId = React.useId();

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
        aria-haspopup="true"
        aria-expanded={open}
        aria-describedby={contentId}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        id={contentId}
        role="tooltip"
        side="top"
        align="center"
        className="bg-background w-max max-w-xs rounded-md border p-2 text-xs shadow-md"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
