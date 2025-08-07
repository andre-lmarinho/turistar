// src/shared/ui/button-icons/CardColorButton.tsx
'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/shared/ui';

export default function CardColorButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Card Color" {...props}>
      <Palette aria-hidden="true" className="group-hover/icon:-rotate-45" />
    </Button>
  );
}
