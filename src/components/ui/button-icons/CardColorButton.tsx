// src/components/ui/button-icons/CardColor.tsx

'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components';

export default function CardColorButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Card Color" {...props}>
      <Palette />
    </Button>
  );
}
