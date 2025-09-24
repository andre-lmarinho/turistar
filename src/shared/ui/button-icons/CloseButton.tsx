// src/shared/ui/button-icons/CloseButton.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export default function CloseButton(props: React.ComponentProps<'button'>) {
  return (
    <Button variant="icon" size="icon" title="Close" {...props}>
      <X aria-hidden="true" className="group-hover/icon:rotate-90" />
    </Button>
  );
}
